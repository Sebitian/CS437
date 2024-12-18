
#include "WiFi.h"
#include <Firebase_ESP_Client.h>
#include "time.h"
#include <string>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include <secrets.h>

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// #define MAC "a0:b7:65:eb:00:88"

bool signupOK = false;

unsigned long lastSendTime = 0;
const unsigned long sendInterval = 10000; // 10 seconds 



// function START -------------------------------------------------
void connectToWiFi() {
  WiFi.begin(WIFI_SSID2, WIFI_PASSWORD2);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED){
    Serial.print(".");
    delay(1000);
  }
};

void initializeFirebase() {
  /* Assign the api key (required) */
  config.api_key = API_KEY;

  /* Assign the RTDB URL (required) */
  config.database_url = DATABASE_URL;

  /* Sign up */
  if (Firebase.signUp(&config, &auth, "", "")){
    Serial.println("Connected to firebase ");
    signupOK = true;
  }
  else{
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  /* Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
};



void updateFirebase() {
  time_t now =  time(nullptr);
  String epochTime = String((unsigned long)now);

  String currentStatus = (WiFi.status() == WL_CONNECTED) ? "CONNECTED" : "DISCONNECTED";
  
  // Send status to Firebase
  if (Firebase.RTDB.setString(&fbdo, "test/wifi_status", currentStatus)) {
    Serial.println("WiFi status sent to Firebase: " + currentStatus);
  } else {
    Serial.println("Failed to send WiFi status to Firebase.");
    Serial.println(fbdo.errorReason());
  }

  // Send timestamp to Firebase
  if (Firebase.RTDB.setString(&fbdo, "test/wifi_timestamp", epochTime)) {
    Serial.println("WiFi timestamp sent to Firebase: " + epochTime);
  } else {
    Serial.println("Failed to send WiFi timestamp to Firebase.");
    Serial.println(fbdo.errorReason());
  }
}

// // String scanWiFi() {
// //   Serial.println("Scanning WiFi networks...");
// //   int n = WiFi.scanNetworks();
// //   DynamicJsonDocument doc(1024);
// //   JsonArray wifiArray = doc.createNestedArray("wifi_towers");
  
// //   for (int i = 0; i < n; ++i) {
// //     JsonObject wifi = wifiArray.createNestedObject();
// //     wifi["macAddress"] = WiFi.BSSIDstr(i);
// //     wifi["signalStrength"] = WiFi.RSSI(i);
// //     wifi["channel"] = WiFi.channel(i);
// //   }
  
// //   String jsonString;
// //   serializeJson(doc, jsonString);
// //   return jsonString;
// // }

// // String getLocation(String wifiList) {
// //   HTTPClient http;
// //   http.begin("https://www.googleapis.com/geolocation/v1/geolocate?key=" + String(googleApiKey));
// //   http.addHeader("Content-Type", "application/json");
  
// //   int httpResponseCode = http.POST(wifiList);
// //   String response = "{}";
  
// //   if (httpResponseCode > 0) {
// //     response = http.getString();
// //   } else {
// //     Serial.println("Error on HTTP request");
// //   }
  
//   http.end();
//   return response;
// }

// functions END --------------------------------------------------

void setup(){
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  connectToWiFi();
  initializeFirebase();
    // if (WiFi.status() == WL_CONNECTED) {
  //   String wifiList = scanWiFi();
  //   String location = getLocation(wifiList);
  //   Serial.println(location);
  // }
}

void loop() {
  if (millis() - lastSendTime >= sendInterval) {
    lastSendTime = millis();
    updateFirebase();
  }
  delay(1000);
}
