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
b_book = orch.determine_resource_budget('read online book about machine learning textbook')
print('Book query budget:', b_book)
