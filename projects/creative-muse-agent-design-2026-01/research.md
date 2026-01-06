# Research Findings: Creative Muse Agent

## 1. Prompt Engineering for "No Praise"
To prevent "praise leakage," we must use **Negative Constraints**. Standard instructions ("Don't praise") are often ignored.
*   **Technique:** "Banned Phrase List."
*   **Implementation:** Explicitly forbid words like: *Great, Interesting, Unique, Fascinating, Well-thought-out, I like, Good job.*
*   **Substitute:** Instruct the agent to use **Neutral Acknowledgments** only: *Noted. Understood. Clear.* or simply jump straight to the analysis.

## 2. World-Building Logic Framework: PESTLE
To give the agent a "standard" to test against, we adapt the PESTLE business framework for fiction:
*   **Political:** Who holds power? How is it transferred? (Coups? Elections? Bloodline?)
*   **Economic:** What is the currency? What happens during scarcity? Who taxes whom?
*   **Social:** Class structure, religious friction, taboos.
*   **Technological:** What is the "tech level"? Is it distributed evenly?
*   **Legal:** How are disputes settled? (Combat? Courts? Elders?)
*   **Environmental:** Climate, geography, resource locations.
*   **Application:** When the user proposes an idea (e.g., "A floating city"), the agent scans PESTLE: *How do they get water (Env)? Who repairs the engines (Soc/Tech)? Do they pay taxes to the ground (Pol/Eco)?*

## 3. Context Management Strategies
For long-form world-building, the context window fills up.
*   **Strategy:** **"The Lore Ledger"** (Abstractive Summarization).
*   **Mechanism:** The agent should maintain a mental (or actual) list of "Established Truths."
*   **Instruction:** "Before answering, cross-reference the user's new statement against [Established Truths]. If contradiction > Flag it. If new > Add it."

## 4. The Socratic Loop
To avoid "giving answers," the agent must operate in a loop:
1.  **Ingest:** Read user input.
2.  **Synthesize:** "So, you are positing a world where [X] is true."
3.  **Project:** "If [X] is true, then logically [Y] should happen."
4.  **Inquire:** "How do you account for [Y]?" OR "Does [Y] align with your intent for [Z]?"
