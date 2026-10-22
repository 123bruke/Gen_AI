import sys
sys.stdout.reconfigure(encoding='utf-8')
from app.agents.orchestrator import orchestrator

orch = orchestrator

# Test 1: Simple greeting
print('--- TEST 1: GREETING ---')
res_hi = orch.plan_and_execute('Hi')
print('Answer:', res_hi.get('text'))
print('Images count:', len(res_hi.get('multimodal', {}).get('images', [])))
print('Videos count:', len(res_hi.get('multimodal', {}).get('videos', [])))
print('Cached:', res_hi.get('metadata', {}).get('cached'))

# Test 2: Semantic cache
print('\n--- TEST 2: CACHE VERIFICATION ---')
res_hi2 = orch.plan_and_execute('hello')
print('Greeting variation answer:', res_hi2.get('text'))
print('Cached status:', res_hi2.get('metadata', {}).get('cached'))

# Test 3: Situation-dependent resource budget
print('\n--- TEST 3: RESOURCE BUDGETS ---')
b_math = orch.determine_resource_budget('solve 2x + 5 = 15')
print('Math query budget:', b_math)
b_img = orch.determine_resource_budget('show me high resolution photos and pictures of Ethiopian wolves')
print('Image query budget:', b_img)
# Test 4: Full query execution and caching
print('\n--- TEST 4: FULL QUERY AND SEMANTIC CACHING ---')
q = "What was the significance of the Battle of Adwa in 1896?"
res_q1 = orch.plan_and_execute(q)
print('Query 1 executed. Sources count:', len(res_q1.get('multimodal', {}).get('websites', [])))
print('Query 1 cached status:', res_q1.get('metadata', {}).get('cached'))

# Now ask semantically identical question:
res_q2 = orch.plan_and_execute("Tell me about the significance of the Battle of Adwa in 1896")
print('Query 2 cached status:', res_q2.get('metadata', {}).get('cached'))
print('Query 2 answer snippet:', res_q2.get('text', '')[:120])

