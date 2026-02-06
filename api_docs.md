# GamerHub Chatbot API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

---

## 1. Get Suggestions

### Endpoint
```
GET /suggestions
```

### Description
Returns predefined suggested questions to help users start a conversation.

### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "What are your shipping options?",
      "How do I return a product?",
      "What payment methods do you accept?",
      "Do you have gaming mice in stock?",
      "What is your warranty policy?"
    ]
  }
}
```

---

## 2. Get Conversations

### Endpoint
```
GET /conversations
```

### Description
Fetch all conversations created by the user.

### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "conversation": [
      {
        "id": "0672b205-31ef-4c63-bdfb-c97a82dba90f",
        "title": "Product history",
        "createdAt": "2026-02-06T07:05:55.866Z",
        "updatedAt": "2026-02-06T07:05:55.866Z"
      },
      {
        "id": "17a4ae69-9ef7-409e-a9a6-065d3111819e",
        "title": "Return Policy",
        "createdAt": "2026-02-06T07:20:47.841Z",
        "updatedAt": "2026-02-06T07:20:47.841Z"
      }
    ]
  }
}
```

---

## 3. Create Conversation

### Endpoint
```
POST /conversations
```

### Request Body
```json
{
  "title": "Return Policy"
}
```

### Response — 201 Created
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "17a4ae69-9ef7-409e-a9a6-065d3111819e",
      "title": "Return Policy",
      "createdAt": "2026-02-06T07:20:47.841Z",
      "updatedAt": "2026-02-06T07:20:47.841Z"
    }
  }
}
```

---

## 4. Send Message

### Endpoint
```
POST /messages/{conversationId}
```

### Path Params
- `conversationId` (UUID)

### Request Body
```json
{
  "text": "Do you sell keyboard"
}
```

### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "conversationId": "0672b205-31ef-4c63-bdfb-c97a82dba90f",
    "userMessageId": "a595bd40-be28-480f-96f8-e8ef6cbfc967",
    "aiMessageId": "63a2756f-5e38-45b3-9a9b-72460f9299a1",
    "response": "Yes, we sell keyboards at GamerHub. We offer a variety of gaming keyboards with different features and specifications."
  }
}
```

---

## 5. Non-Store Related Question

### Example Request
```json
{
  "text": "Who is PM of India"
}
```

### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "response": "I'm here to help with questions about GamerHub store - our gaming products, shipping, returns, and orders."
  }
}
```

---

## 6. Moderation Failure (Threats / Abuse / Sexual Content)

### Example Request
```json
{
  "text": "I wanna kill you"
}
```

### Response — 400 Bad Request
```json
{
  "success": false,
  "data": {
    "conversationId": "0672b205-31ef-4c63-bdfb-c97a82dba90f",
    "message": "Your message contains content that violates our guidelines. Please rephrase and try again."
  }
}
```

---

## 7. Get Messages by Conversation

### Endpoint
```
GET /messages/{conversationId}
```

### Response — 200 OK
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "7bb2c483-8812-4c80-a5ec-8b451caa690e",
        "conversationId": "0672b205-31ef-4c63-bdfb-c97a82dba90f",
        "sender": "user",
        "text": "Do you ship to Pakistan",
        "createdAt": "2026-02-06T11:07:58.579Z",
        "updatedAt": "2026-02-06T11:07:58.579Z"
      },
      {
        "id": "9de2dcfc-e45c-43f9-85bd-e46642db433f",
        "conversationId": "0672b205-31ef-4c63-bdfb-c97a82dba90f",
        "sender": "ai",
        "text": "Currently, we only ship to USA, India, Japan, and China.",
        "createdAt": "2026-02-06T11:08:00.522Z",
        "updatedAt": "2026-02-06T11:08:00.522Z"
      }
    ]
  }
}
```

---

## Notes
- All IDs are UUID v4
- Messages are moderated before AI processing
- AI answers only GamerHub store-related queries
- Conversations preserve full message context
