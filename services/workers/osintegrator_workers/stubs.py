from __future__ import annotations

from .adapter import ToolResult


class StubSherlockAdapter:
    tool_name = "stub_sherlock"

    def run(self, query: str) -> ToolResult:
        return ToolResult(
            tool_name=self.tool_name,
            summary=f"Stubbed username search completed for {query}.",
            evidence=[
                {
                    "sourceType": "tool",
                    "sourceRef": "stub://sherlock",
                    "summary": "Returned placeholder account hints from the adapter scaffold.",
                }
            ],
            claims=[
                {
                    "predicate": "possible_social_account",
                    "value": f"{query} on a placeholder network",
                    "confidence": 0.64,
                }
            ],
        )


class StubSpiderfootAdapter:
    tool_name = "stub_spiderfoot"

    def run(self, query: str) -> ToolResult:
        return ToolResult(
            tool_name=self.tool_name,
            summary=f"Stubbed enrichment completed for {query}.",
            evidence=[
                {
                    "sourceType": "tool",
                    "sourceRef": "stub://spiderfoot",
                    "summary": "Returned placeholder employer and footprint enrichment.",
                }
            ],
            claims=[
                {
                    "predicate": "possible_professional_trace",
                    "value": f"{query} with placeholder domain and organization match",
                    "confidence": 0.72,
                }
            ],
        )
