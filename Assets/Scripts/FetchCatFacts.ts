import Event from "Scripts/Events"
import {CAT_FACTS} from "./CatFacts"

/**
 * Serves cat facts from a local, bundled dataset — no internet required.
 *
 * The class name is kept as `FetchCatFacts` (and the file unchanged) so the
 * existing Scene component reference and CatFactAnimator's `fetchCatFacts`
 * @input binding stay valid. It no longer fetches anything over the network;
 * `getCatFacts()` now picks a random fact locally and fires the same event.
 */
@component
export class FetchCatFacts extends BaseScriptComponent {
  catFactReceived: Event<string>

  // Index of the fact shown last, so we never repeat the same fact twice in a row.
  private lastIndex = -1

  onAwake() {
    this.catFactReceived = new Event<string>()
  }

  public getCatFacts() {
    const fact = this.pickRandomFact()
    this.catFactReceived.invoke(fact)
  }

  private pickRandomFact(): string {
    if (CAT_FACTS.length === 0) {
      return ""
    }
    if (CAT_FACTS.length === 1) {
      this.lastIndex = 0
      return CAT_FACTS[0]
    }

    let index = Math.floor(Math.random() * CAT_FACTS.length)
    if (index === this.lastIndex) {
      index = (index + 1) % CAT_FACTS.length
    }
    this.lastIndex = index
    return CAT_FACTS[index]
  }
}
