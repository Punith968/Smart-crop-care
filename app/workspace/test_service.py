import sys
from pathlib import Path

# Add project root to path
sys.path.append(str(Path(__file__).resolve().parents[3]))

from app.workspace.service import run_advisory_workspace
from app.workspace.schema import AdvisoryWorkspaceRequest

payload = AdvisoryWorkspaceRequest(
    N=60, P=30, K=20,
    temperature=28, humidity=65, ph=6.2,
    rainfall=120, moisture=28,
    soil_type="Sandy",
    acres=2.0
)

try:
    result = run_advisory_workspace(payload)
    print("SUCCESS")
    print(result)
except Exception as e:
    import traceback
    print("FAILED")
    traceback.print_exc()
