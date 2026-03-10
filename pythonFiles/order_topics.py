import firebase_admin
from firebase_admin import credentials, firestore
import os

BASE_DIR=os.path.dirname(__file__)

cred=credentials.Certificate(
os.path.join(BASE_DIR,"court-side-6c75a-firebase-adminsdk-fbsvc-a3e3c08ca9.json")
)

firebase_admin.initialize_app(cred)

db=firestore.client()

order_map={
"Introduction to Computer Networks":1,
"Types of Computer Networks":2,
"Network Topologies":3,
"Network Models":4,
"Switching Techniques":5,
"Network Devices":6,
"Network Layer Fundamentals":7,
"IPv4 Addressing and Subnetting":8,
"Routing Algorithms":9,
"Transport Layer Fundamentals":10,
"Transmission Control Protocol (TCP)":11,
"User Datagram Protocol (UDP)":12,
"Flow Control and Error Control":13,
"Sliding Window Protocols (ARQ)":14,
"Congestion Control":15,
"Important Network Protocols":16,
"Network Performance Metrics":17
}

topics=db.collection("topics").stream()

for topic in topics:

    title=topic.to_dict()["title"]

    if title in order_map:
        db.collection("topics").document(topic.id).update({
            "order":order_map[title]
        })

        print("Updated",title)

print("✅ Topic ordering complete")