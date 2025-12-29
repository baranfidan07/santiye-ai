import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/chat_message.dart';
import '../utils/constants.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  Stream<List<ChatMessage>> getMessages() {
    return _db
        .collection(Constants.chatCollection)
        .orderBy('timestamp', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => ChatMessage.fromDocument(doc))
            .toList());
  }

  Future<void> sendMessage(String text, String senderId, String senderName) async {
    await _db.collection(Constants.chatCollection).add({
      'text': text,
      'senderId': senderId,
      'senderName': senderName,
      'timestamp': FieldValue.serverTimestamp(),
    });
  }
}
