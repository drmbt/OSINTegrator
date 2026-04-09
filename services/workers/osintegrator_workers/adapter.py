from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


@dataclass
class ToolResult:
    tool_name: str
    summary: str
    evidence: list[dict[str, str]]
    claims: list[dict[str, str | float]]


class ToolAdapter(Protocol):
    tool_name: str

    def run(self, query: str) -> ToolResult:
        """Execute the adapter and return normalized scaffold output."""
