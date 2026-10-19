import sys, time
sys.path.insert(0, 'backend')

print("Importing AgenticOrchestrator...")
from app.agents.orchestrator import agent_orchestrator

query = "What is the fleet size of Ethiopian Airlines?"

print("1. Testing retriever...")
t0 = time.time()
items = agent_orchestrator.retriever.retrieve(query, top_k=4)
print("Retriever done in", round(time.time() - t0, 3), "s. Items:", len(items))

print("2. Testing maps tool...")
t0 = time.time()
maps = agent_orchestrator.tools["google_maps"].execute(query)
print("Maps done in", round(time.time() - t0, 3), "s:", maps.get("locationName"))

print("3. Testing realtime_search tool...")
t0 = time.time()
search = agent_orchestrator.tools["realtime_search"].execute(query)
print("Search done in", round(time.time() - t0, 3), "s:", len(search))

print("4. Testing evidence_builder...")
t0 = time.time()
resp = agent_orchestrator.evidence_builder.build_multimodal_response(query, items)
print("Evidence builder done in", round(time.time() - t0, 3), "s")

print("5. Testing full plan_and_execute...")
t0 = time.time()
full_res = agent_orchestrator.plan_and_execute(query)
print("Full plan_and_execute done in", round(time.time() - t0, 3), "s")
print("ALL AGENT STEPS PASSED!")
