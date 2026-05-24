#define CURRENT_VERSION "1.0.2"

#include <WiFi.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <PubSubClient.h>
#include <EEPROM.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <HTTPUpdate.h>
#include <WiFiClientSecure.h>
#include <WiFiManager.h>
#include <esp_ota_ops.h>
#include <ESPmDNS.h>
#include <time.h>

const char* mqtt_server = "rin-adri.local";

WiFiClient   espClient;
PubSubClient client(espClient);

String deviceID = "";

#define DHTPIN       14
#define DHTTYPE      DHT11
#define RELAY_PIN    27
#define SOIL_PIN     32
#define ONE_WIRE_BUS  5
#define SDA_PIN      21
#define SCL_PIN      22

#define EEPROM_SIZE 200

struct Config {
  int soilThreshold;
  int soilMax;
  int tempThreshold;
  int humThreshold;
  int publishInterval;
};

Config config;

#define MAX_SCHEDULES 10

struct Schedule {
  bool    active;
  uint8_t days;
  uint8_t hour;
  uint8_t minute;
};

Schedule schedules[MAX_SCHEDULES];
int      scheduleCount = 0;
bool     scheduleTriggeredToday[MAX_SCHEDULES] = {};

DHT               dht(DHTPIN, DHTTYPE);
OneWire           oneWire(ONE_WIRE_BUS);
DallasTemperature ds18b20(&oneWire);
LiquidCrystal_I2C lcd(0x27, 16, 2);
WiFiManager       wm;

float tempDHT, hum, tempDS;
int   soil;

bool autoMode   = true;
bool relayState = false;

unsigned long lastWifiCheck  = 0;
unsigned long lastMqttCheck  = 0;
unsigned long lastHeartbeat  = 0;
unsigned long lastPublish    = 0;
unsigned long lastSchedCheck = 0;
unsigned long lastInfoPub    = 0;
unsigned long lastOtaCheck   = 0;

const unsigned long WIFI_CHECK_INTERVAL  = 10000;
const unsigned long MQTT_CHECK_INTERVAL  = 1000;
const unsigned long HEARTBEAT_INTERVAL   = 10000;
const unsigned long INFO_PUB_INTERVAL    = 60000;
const unsigned long SCHED_CHECK_INTERVAL = 30000;
const unsigned long OTA_CHECK_INTERVAL   = 21600000UL;


void saveConfig() {
  EEPROM.put(0, config);
  EEPROM.commit();
}

void loadConfig() {
  EEPROM.get(0, config);

  if (config.soilThreshold  < 0  || config.soilThreshold  > 100) config.soilThreshold  = 30;
  if (config.soilMax        < 0  || config.soilMax        > 100) config.soilMax        = 80;
  if (config.tempThreshold  < 10 || config.tempThreshold  > 60)  config.tempThreshold  = 35;
  if (config.humThreshold   < 0  || config.humThreshold   > 100) config.humThreshold   = 40;
  if (config.publishInterval < 1 || config.publishInterval > 60) config.publishInterval = 5;
}


void parseSchedules(const char* jsonStr) {
  StaticJsonDocument<1024> doc;
  if (deserializeJson(doc, jsonStr)) return;

  JsonArray arr = doc["schedules"].as<JsonArray>();
  scheduleCount = 0;

  for (JsonObject s : arr) {
    if (scheduleCount >= MAX_SCHEDULES) break;

    String timeStr = s["time"] | "00:00";
    int    hour    = timeStr.substring(0, 2).toInt();
    int    minute  = timeStr.substring(3, 5).toInt();

    uint8_t dayBits = 0;
    JsonArray days = s["days"].as<JsonArray>();
    for (JsonVariant d : days) {
      int dayIdx = d.as<int>();
      if (dayIdx >= 0 && dayIdx <= 6) {
        dayBits |= (1 << dayIdx);
      }
    }

    schedules[scheduleCount].active  = true;
    schedules[scheduleCount].days    = dayBits;
    schedules[scheduleCount].hour    = hour;
    schedules[scheduleCount].minute  = minute;
    scheduleTriggeredToday[scheduleCount] = false;

    scheduleCount++;
  }

  client.publish(
    ("smartgarden/" + deviceID + "/terminal/output").c_str(),
    ("Schedules loaded: " + String(scheduleCount)).c_str()
  );
}


void checkSchedules() {
  if (scheduleCount == 0) return;
  if (!autoMode) return;

  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) return;

  int nowHour   = timeinfo.tm_hour;
  int nowMinute = timeinfo.tm_min;
  int nowWday   = timeinfo.tm_wday;
  int ourDay    = (nowWday == 0) ? 6 : nowWday - 1;

  for (int i = 0; i < scheduleCount; i++) {
    if (!schedules[i].active) continue;

    bool dayMatch  = (schedules[i].days >> ourDay) & 1;
    bool timeMatch = (schedules[i].hour == nowHour && schedules[i].minute == nowMinute);

    if (dayMatch && timeMatch && !scheduleTriggeredToday[i]) {
      relayState = true;
      digitalWrite(RELAY_PIN, LOW);
      client.publish(("smartgarden/" + deviceID + "/status/relay").c_str(), "ON");
      client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), "Schedule triggered — pompa nyala");
      scheduleTriggeredToday[i] = true;
    }

    if (!timeMatch) {
      scheduleTriggeredToday[i] = false;
    }
  }
}


void checkForUpdate() {
  client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), "Checking OTA...");

  WiFiClientSecure clientSecure;
  clientSecure.setInsecure();

  HTTPClient https;
  https.begin(clientSecure, "https://kelompok6.my.id/firmware/version.json");

  int httpCode = https.GET();

  if (httpCode != 200) {
    client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), "OTA HTTP ERROR");
    https.end();
    return;
  }

  String payload = https.getString();
  StaticJsonDocument<256> doc;

  if (deserializeJson(doc, payload)) {
    client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), "OTA JSON ERROR");
    https.end();
    return;
  }

  String newVersion = doc["version"].as<String>();
  String firmwareURL= doc["url"].as<String>();

  if (newVersion != CURRENT_VERSION) {
    client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), "Updating firmware...");
    httpUpdate.update(clientSecure, firmwareURL);
  } else {
    client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), "Already latest version");
  }

  https.end();
}


void sendHeartbeat() {
  if (!client.connected()) return;
  client.publish(("smartgarden/" + deviceID + "/status/device").c_str(), "ONLINE", true);
}


void publishInfo() {
  if (!client.connected()) return;
  unsigned long upSec = millis() / 1000;
  StaticJsonDocument<256> doc;
  doc["fw"]     = CURRENT_VERSION;
  doc["ip"]     = WiFi.localIP().toString();
  doc["mac"]    = WiFi.macAddress();
  doc["ssid"]   = WiFi.SSID();
  doc["rssi"]   = WiFi.RSSI();
  doc["heap"]   = ESP.getFreeHeap();
  doc["cpu"]    = ESP.getCpuFreqMHz();
  doc["uptime"] = upSec;
  char buf[256];
  serializeJson(doc, buf);
  client.publish(("smartgarden/" + deviceID + "/status/info").c_str(), buf, true);
}


void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) message += (char)payload[i];
  message.trim();

  String topicStr = String(topic);
  String msgLower = message;
  msgLower.toLowerCase();

  if (topicStr == "smartgarden/" + deviceID + "/control/mode") {
    autoMode = (msgLower == "auto");

    if (autoMode) {
      if (soil < config.soilThreshold)  relayState = true;
      else if (soil > config.soilMax)   relayState = false;
      digitalWrite(RELAY_PIN, relayState ? LOW : HIGH);
    }

    client.publish(("smartgarden/" + deviceID + "/status/mode").c_str(), autoMode ? "AUTO" : "MANUAL");
  }

  if (topicStr == "smartgarden/" + deviceID + "/control/relay") {
    if (!autoMode) {
      relayState = (msgLower == "on");
      digitalWrite(RELAY_PIN, relayState ? LOW : HIGH);
      client.publish(("smartgarden/" + deviceID + "/status/relay").c_str(), relayState ? "ON" : "OFF");
    }
  }

  if (topicStr == "smartgarden/" + deviceID + "/config") {
    StaticJsonDocument<256> doc;
    if (!deserializeJson(doc, message)) {
      if (doc.containsKey("soilThreshold"))  config.soilThreshold  = doc["soilThreshold"];
      if (doc.containsKey("soilMax"))        config.soilMax        = doc["soilMax"];
      if (doc.containsKey("tempThreshold"))  config.tempThreshold  = doc["tempThreshold"];
      if (doc.containsKey("humThreshold"))   config.humThreshold   = doc["humThreshold"];
      if (doc.containsKey("publishInterval")) config.publishInterval = doc["publishInterval"];

      saveConfig();

      client.publish(
        ("smartgarden/" + deviceID + "/terminal/output").c_str(),
        ("Config updated — Soil:" + String(config.soilThreshold) +
         "-" + String(config.soilMax) +
         " Temp:" + String(config.tempThreshold) +
         " Hum:"  + String(config.humThreshold)).c_str()
      );
    }
  }

  if (topicStr == "smartgarden/" + deviceID + "/schedules") {
    parseSchedules(message.c_str());
  }

  if (topicStr == "smartgarden/" + deviceID + "/terminal/input") {
    if (msgLower == "list") {
      String cmd = "commands:\nespinfo\nsensor\nping\nrestart\nupdate\nversion\nwifi\nwifi reset\nheap\nip\nrelay on\nrelay off\nmode auto\nmode manual\nset soil <n>\nset soilmax <n>\nset temp <n>\nset hum <n>\nschedules";
      client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), cmd.c_str());
    }

    else if (msgLower == "update")  checkForUpdate();

    else if (msgLower == "restart") {
      client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), "Restarting...");
      delay(500);
      ESP.restart();
    }

    else if (msgLower == "version") {
      client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), ("Firmware:" + String(CURRENT_VERSION)).c_str());
    }

    else if (msgLower == "wifi") {
      String info = "SSID:" + WiFi.SSID() + " RSSI:" + String(WiFi.RSSI());
      client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), info.c_str());
    }

    else if (msgLower == "wifi reset") {
      client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), "Resetting WiFi...");
      delay(500);
      wm.resetSettings();
      WiFi.disconnect(true);
      delay(1000);
      ESP.restart();
    }

    else if (msgLower == "heap") {
      client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), ("Heap:" + String(ESP.getFreeHeap())).c_str());
    }

    else if (msgLower == "ip") {
      client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), ("IP:" + WiFi.localIP().toString()).c_str());
    }

    else if (msgLower == "ping") {
      client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), "pong");
    }

    else if (msgLower == "espinfo") {
      unsigned long upSec = millis() / 1000;
      String s = "DeviceID:" + deviceID;
      s += " FW:"     + String(CURRENT_VERSION);
      s += " IP:"     + WiFi.localIP().toString();
      s += " MAC:"    + WiFi.macAddress();
      s += " SSID:"   + WiFi.SSID();
      s += " RSSI:"   + String(WiFi.RSSI()) + "dBm";
      s += " Heap:"   + String(ESP.getFreeHeap()) + "B";
      s += " CPU:"    + String(ESP.getCpuFreqMHz()) + "MHz";
      s += " Uptime:" + String(upSec) + "s";
      client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), s.c_str());
    }

    else if (msgLower == "sensor") {
      String s = "Mode:"    + String(autoMode ? "AUTO" : "MANUAL");
      s += " Relay:"        + String(relayState ? "ON" : "OFF");
      s += " Soil:"         + String(soil) + "%";
      s += " SoilMin:"      + String(config.soilThreshold);
      s += " SoilMax:"      + String(config.soilMax);
      s += " TempDHT:"      + String(tempDHT) + "C";
      s += " Hum:"          + String(hum) + "%";
      s += " TempDS:"       + String(tempDS) + "C";
      s += " Interval:"     + String(config.publishInterval) + "s";
      client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), s.c_str());
    }

    else if (msgLower == "relay on") {
      relayState = true;
      digitalWrite(RELAY_PIN, LOW);
      client.publish(("smartgarden/" + deviceID + "/status/relay").c_str(), "ON");
      client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), "Relay: ON");
    }

    else if (msgLower == "relay off") {
      relayState = false;
      digitalWrite(RELAY_PIN, HIGH);
      client.publish(("smartgarden/" + deviceID + "/status/relay").c_str(), "OFF");
      client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), "Relay: OFF");
    }

    else if (msgLower == "mode auto") {
      autoMode = true;
      client.publish(("smartgarden/" + deviceID + "/status/mode").c_str(), "AUTO");
      client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), "Mode: AUTO");
    }

    else if (msgLower == "mode manual") {
      autoMode = false;
      client.publish(("smartgarden/" + deviceID + "/status/mode").c_str(), "MANUAL");
      client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), "Mode: MANUAL");
    }

    else if (msgLower == "schedules") {
      client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), ("Schedules loaded:" + String(scheduleCount)).c_str());
    }

    else if (msgLower.startsWith("set ")) {
      int value = msgLower.substring(msgLower.lastIndexOf(" ") + 1).toInt();

      if      (msgLower.indexOf("soilmax") > 0) { config.soilMax       = value; saveConfig(); client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), "SoilMax updated"); }
      else if (msgLower.indexOf("soil")    > 0) { config.soilThreshold = value; saveConfig(); client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), "Soil threshold updated"); }
      else if (msgLower.indexOf("temp")    > 0) { config.tempThreshold = value; saveConfig(); client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), "Temp threshold updated"); }
      else if (msgLower.indexOf("hum")     > 0) { config.humThreshold  = value; saveConfig(); client.publish(("smartgarden/" + deviceID + "/terminal/output").c_str(), "Hum threshold updated"); }
    }
  }
}


void reconnect() {
  if (client.connected()) return;

  if (client.connect(
    ("ESP32-" + deviceID).c_str(),
    ("smartgarden/" + deviceID + "/status/device").c_str(), 0, true, "OFFLINE"
  )) {
    client.subscribe(("smartgarden/" + deviceID + "/control/mode").c_str());
    client.subscribe(("smartgarden/" + deviceID + "/control/relay").c_str());
    client.subscribe(("smartgarden/" + deviceID + "/terminal/input").c_str());
    client.subscribe(("smartgarden/" + deviceID + "/config").c_str());
    client.subscribe(("smartgarden/" + deviceID + "/schedules").c_str());

    client.publish(("smartgarden/" + deviceID + "/status/device").c_str(), "ONLINE", true);
    publishInfo();
  }
}


void checkWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  WiFi.reconnect();
}


void readSensor() {
  tempDHT = dht.readTemperature();
  hum     = dht.readHumidity();

  ds18b20.requestTemperatures();
  tempDS = ds18b20.getTempCByIndex(0);

  soil = analogRead(SOIL_PIN);
  soil = map(soil, 3600, 1500, 0, 100);
  soil = constrain(soil, 0, 100);

  if (autoMode) {
    if (soil < config.soilThreshold) relayState = true;
    if (soil > config.soilMax)       relayState = false;
  }

  digitalWrite(RELAY_PIN, relayState ? LOW : HIGH);

  client.publish(("smartgarden/" + deviceID + "/sensor/dht").c_str(),     String(tempDHT).c_str());
  client.publish(("smartgarden/" + deviceID + "/sensor/ds18b20").c_str(), String(tempDS).c_str());
  client.publish(("smartgarden/" + deviceID + "/sensor/soil").c_str(),    String(soil).c_str());
  client.publish(("smartgarden/" + deviceID + "/sensor/hum").c_str(),     String(hum).c_str());
  client.publish(("smartgarden/" + deviceID + "/status/relay").c_str(),   relayState ? "ON" : "OFF");
  client.publish(("smartgarden/" + deviceID + "/status/mode").c_str(),    autoMode   ? "AUTO" : "MANUAL");

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Soil:");
  lcd.print(soil);
  lcd.print("%");

  lcd.setCursor(0, 1);
  lcd.print(relayState ? "Pompa:ON " : "Pompa:OFF");
  lcd.print(autoMode   ? "A" : "M");
}


void setup() {
  Serial.begin(115200);

  EEPROM.begin(EEPROM_SIZE);
  loadConfig();

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);

  Wire.begin(SDA_PIN, SCL_PIN);
  lcd.init();
  lcd.backlight();

  dht.begin();
  ds18b20.begin();

  bool res = wm.autoConnect("Penyiram tanaman otomatis", "adriadriadri");
  if (!res) ESP.restart();

  String mac = WiFi.macAddress();
  mac.replace(":", "");
  mac.toLowerCase();
  deviceID = "esp32-" + mac;

  configTime(7 * 3600, 0, "pool.ntp.org", "time.nist.gov");

  MDNS.begin("esp32");

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}


void loop() {
  unsigned long now = millis();

  if (now - lastWifiCheck > WIFI_CHECK_INTERVAL) {
    lastWifiCheck = now;
    checkWiFi();
  }

  if (now - lastMqttCheck > MQTT_CHECK_INTERVAL) {
    lastMqttCheck = now;
    if (!client.connected()) reconnect();
  }

  if (now - lastHeartbeat > HEARTBEAT_INTERVAL) {
    lastHeartbeat = now;
    sendHeartbeat();
  }

  if (now - lastPublish > (unsigned long)(config.publishInterval * 1000)) {
    lastPublish = now;
    readSensor();
  }

  if (now - lastSchedCheck > SCHED_CHECK_INTERVAL) {
    lastSchedCheck = now;
    checkSchedules();
  }

  if (now - lastInfoPub > INFO_PUB_INTERVAL) {
    lastInfoPub = now;
    publishInfo();
  }

  if (now - lastOtaCheck > OTA_CHECK_INTERVAL) {
    lastOtaCheck = now;
    checkForUpdate();
  }

  client.loop();
}
