#include "SSD1306.h"
#include <qrcode.h>

#include <NTPClient.h>
#include <WiFiUdp.h>

#include <SPI.h>
#include <MFRC522.h>

#include <FirebaseESP8266.h>
#include <ESP8266WiFi.h>

#include <Servo.h> //Thư viện servo

#define SS_PIN D4 // SS pin for RC522 module, connected to D4
#define RST_PIN D3 // RST pin for RC522 module, connected to D3

MFRC522 mfrc522(SS_PIN, RST_PIN); // Create MFRC522 instance

#define FIREBASE_HOST ""
#define FIREBASE_AUTH ""
 #define WIFI_SSID ""
 #define WIFI_PASSWORD ""

FirebaseData firebaseData;

Servo s1;  

WiFiUDP u;
NTPClient n(u, "l.asia.pool.ntp.org", 7*3600); //khai báo try cập ntp server khu vực ASIA

SSD1306Wire display(0x3c, D2, D1); //SDA D2, SCL D1
QRcode qrcode(&display);

void setup() {
  Serial.begin(115200);
  SPI.begin(); // Init SPI bus
  mfrc522.PCD_Init(); // Init RC522
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD); // Connect to Wi-Fi

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);

  n.begin(); //khởi động truy cập server thời gian

  s1.attach(15); //kết nối với chân D8, xem sơ đồ chân trên mạng là hiểu 

  display.init();
  display.display();

  qrcode.init();

  pinMode(D0, OUTPUT); //còi       digitalWrite(D0, HIGH);

}
//Có 2 device bao gồm BookedRoom_B và BookedRoom_B
void loop() {
  if(!Firebase.getString(firebaseData, "/device/BookedRoom_B/data")){
    Serial.print("Device is not exist in the firebase, create new ");
    createNewFirebase();
  }

  sendRFIDtoFirebase();
  Logic();

  n.update();
  int realtime = n.getSeconds();
  Firebase.setInt(firebaseData, "/device/BookedRoom_B/realtime", realtime);
  delay(500);
  
  
  

}

void createNewFirebase(){
  int active = 2;
  String default_input = "null";
  String detect_danger = "no";
  String note = "Device is used to book a table";
  String type = "booked_room";
  int realtime = 0;

  Firebase.setInt(firebaseData, "/device/BookedRoom_B/active", active);
  Firebase.setString(firebaseData, "/device/BookedRoom_B/data", default_input);
  Firebase.setString(firebaseData, "/device/BookedRoom_B/detect_danger", detect_danger);
  Firebase.setString(firebaseData, "/device/BookedRoom_B/device_message", default_input);
  Firebase.setString(firebaseData, "/device/BookedRoom_B/device_message2", default_input);
  Firebase.setString(firebaseData, "/device/BookedRoom_B/id_booked_room", default_input);
  Firebase.setString(firebaseData, "/device/BookedRoom_B/note", note);
  Firebase.setString(firebaseData, "/device/BookedRoom_B/type", type);
  Firebase.setInt(firebaseData, "/device/BookedRoom_B/realtime", realtime);
}

void sendRFIDtoFirebase(){
  Firebase.getString(firebaseData, "/device/BookedRoom_B/data");
  String input_data = firebaseData.stringData();

  Firebase.getString(firebaseData, "/device/BookedRoom_B/detect_danger");
  String input_detect_danger = firebaseData.stringData();

  Firebase.getString(firebaseData, "/device/BookedRoom_B/device_message");
  String input_device_message = firebaseData.stringData();

  Firebase.getString(firebaseData, "/device/BookedRoom_B/device_message2");
  String input_device_message2 = firebaseData.stringData();
  
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    String rfidData = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      rfidData += String(mfrc522.uid.uidByte[i], HEX);
    }
    delay(500);

    Firebase.setString(firebaseData, "/device/BookedRoom_B/data", rfidData);
    
    if (firebaseData.dataType() == "string") {
      Serial.print("Data sent to Firebase: ");
      Serial.println(firebaseData.stringData());
      Serial.println(rfidData);
      delay(500);
    } else {
      Serial.println("Failed to send data to Firebase");
      delay(5000);
    }
    delay(500); // Wait a bit before scanning for another card
  }
}

void Logic(){
  Firebase.getString(firebaseData, "/device/BookedRoom_B/data");
  String input_data = firebaseData.stringData();

  Firebase.getString(firebaseData, "/device/BookedRoom_B/detect_danger");
  String input_detect_danger = firebaseData.stringData();

  Firebase.getString(firebaseData, "/device/BookedRoom_B/device_message");
  String input_device_message = firebaseData.stringData();

  Firebase.getString(firebaseData, "/device/BookedRoom_B/device_message2");
  String input_device_message2 = firebaseData.stringData();

  Firebase.getString(firebaseData, "/device/BookedRoom_B/id_booked_room");
  String input_id_booked_room = firebaseData.stringData();

  String default_input = "null";
  String denied_message = "Denied Access";
  String allow_message = "Welcome Staff";
  String normal = "no"; String warning_fire = "yes";

  if(input_detect_danger == warning_fire){ //trường hợp có cháy
    s1.write(0);

    digitalWrite(D0, HIGH);
    delay(700);
    digitalWrite(D0, LOW);
    delay(700);
    digitalWrite(D0, HIGH);
    delay(700);
    digitalWrite(D0, LOW);
    delay(700);
    digitalWrite(D0, HIGH);
    delay(700);

    Firebase.setString(firebaseData, "/device/BookedRoom_B/data", default_input);
    delay(500);
  } else {
    digitalWrite(D0, LOW);

    //Trường hợp phòng chưa có gì, đang free
    if(input_device_message == default_input && input_device_message2 == default_input && input_id_booked_room == default_input){
      display.resetDisplay();
      Firebase.setString(firebaseData, "/device/BookedRoom_B/data", default_input);
      Serial.println("Free Room");
      s1.write(180);  
      delay(500);

    //trường hợp phòng đã được đặt
    } else if(input_id_booked_room != default_input){
      qrcode.create(input_device_message2);
      if(input_device_message == default_input){
        s1.write(180);  
        Serial.println("Room is used, not detect input RFID");
        delay(500);
      } else if(input_device_message == denied_message){ //từ chối người dùng vào phòng
        s1.write(180);  
        Serial.println("Denied Access");
        delay(1500);
        Firebase.setString(firebaseData, "/device/BookedRoom_B/device_message", default_input);
        Firebase.setString(firebaseData, "/device/BookedRoom_B/data", default_input);
        digitalWrite(D0, HIGH);
        delay(1000);
        digitalWrite(D0, LOW);
        delay(500);
      } else if(input_device_message == allow_message){ //cho phép người dùng vào phòng
        s1.write(0);  
        Serial.println("Welcome User, Door open");

        digitalWrite(D0, HIGH);
        delay(250);
        digitalWrite(D0, LOW);
        delay(250);
        digitalWrite(D0, HIGH);
        delay(250);
        digitalWrite(D0, LOW);
        delay(250);
        digitalWrite(D0, HIGH);
        delay(250);
        digitalWrite(D0, LOW);

        delay(1000);
        Firebase.setString(firebaseData, "/device/BookedRoom_B/data", default_input);
        delay(250);
        Firebase.setString(firebaseData, "/device/BookedRoom_B/device_message", default_input);
        s1.write(180);  
        delay(500);
      }
    }
  }
}


















