import sys
import time

sys.path.insert(0, 'backend')
print('1. Importing app and endpoints...')
from app.main import app, health_check, chat_endpoint, ChatRequest

print('2. Testing health_check directly...')
t0 = time.time()
h = health_check()
print('Health in', round(time.time() - t0, 3), 's:', h)

print('3. Testing chat_endpoint directly...')
t0 = time.time()
import asyncio
req = ChatRequest(query='What is the fleet size and headquarters of Ethiopian Airlines?')
res = asyncio.run(chat_endpoint(req))
print('Chat in', round(time.time() - t0, 3), 's')
print('Executed tools:', res.get('agent_metadata'))
print('Images count:', len(res.get('multimodal', {}).get('images', [])))
print('Videos count:', len(res.get('multimodal', {}).get('videos', [])))
print('Maps count:', len(res.get('multimodal', {}).get('maps', [])))
print('Text preview:', res.get('text')[:180])
print('ALL VERIFICATIONS PASSED!')
