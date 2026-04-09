from __future__ import annotations

import sys
from pathlib import Path

SHARED_PYTHON_PATH = Path(__file__).resolve().parents[3] / "packages" / "shared" / "python"

if str(SHARED_PYTHON_PATH) not in sys.path:
    sys.path.append(str(SHARED_PYTHON_PATH))

from osintegrator_shared import CASE_MODES, CLAIM_STATUSES, PROVIDERS  # noqa: E402

CONTRACTS_ROOT = Path(__file__).resolve().parents[3] / "packages" / "shared" / "contracts"
