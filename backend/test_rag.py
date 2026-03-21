import requests

print("Testing Chat Pipeline...")
response = requests.post(
    "http://127.0.0.1:8000/chat",
    json={
        "messages": [{"role": "user", "content": "What does Unit 1 cover?"}],
        "model": "gemini-2.5-flash",
        "chat_id": "test-chat",
        "user_id": "test-user"
    }
)
print(f"Status Code: {response.status_code}")
print(f"JSON Body: {response.json()}")
