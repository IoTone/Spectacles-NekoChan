import {LSTween} from "LSTween.lspkg/LSTween"
import Easing from "LSTween.lspkg/TweenJS/Easing"
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {FetchCatFacts} from "./FetchCatFacts"

const TEXT_SLEEPING = "むにゃ… おひるね中だにゃ。またあとで来てにゃ！"
const TEXT_ACTIVE = "にゃー！おかえり！猫の豆知識を話すにゃ！"

// Delay before the thought bubble first fades in. The first fact's text and
// narration are timed to this so they land as the bubble appears, not before.
const REVEAL_DELAY_MS = 1500

@component
export class CatFactAnimator extends BaseScriptComponent {
  @input
  thoughtBubbleImage: Image // Image component for the thought bubble
  @input
  thoughtBubbleText: Text // Text component for the thought bubble

  @input
  fetchCatFacts: FetchCatFacts // Component to fetch cat facts

  @input
  catInteractable: Interactable // Interactable component for the cat

  @input
  animationPlayer: AnimationPlayer // Animation player component

  @input
  hintImage: Image // Image component for the hint

  @input("Component.ScriptComponent")
  animationStateMachine: any // State machine for animations

  // Flag to check if the interaction has been activated once
  private hasBeenActivatedOnce = false
  private catIsActive = false
  private textBubbleIsShown = false

  onAwake() {
    // Initialize the thought bubble with no alpha
    this.initializeThoughtBubble()

    this.createEvent("OnPauseEvent").bind(() => {
      if (this.catIsActive) {
        this.dectivateCat()
        this.thoughtBubbleText.text = TEXT_SLEEPING
      }
    })

    this.createEvent("OnResumeEvent").bind(() => {
      if (this.hasBeenActivatedOnce) {
        this.activateCat(false)
        this.thoughtBubbleText.text = TEXT_ACTIVE
      }
    })

    // Add event listener for cat interaction. Facts are served locally, so a
    // tap always wakes the cat and shows a new fact — no internet required.
    this.catInteractable.onTriggerStart.add((args) => {
      this.activateCat(true)
    })

    // Update thought bubble text when a cat fact is received
    this.fetchCatFacts.catFactReceived.add((args) => {
      this.thoughtBubbleText.text = args
    })
  }

  private activateCat(fetchFacts: boolean) {
    const isFirstReveal = !this.catIsActive
    if (!this.catIsActive) {
      this.catIsActive = true
      this.hasBeenActivatedOnce = true

      this.animateShowingTextBubble()

      this.animationStateMachine.setTrigger("stand")
    }

    if (!fetchFacts) {
      return
    }

    // On the first reveal the bubble fades in after REVEAL_DELAY_MS. Hold the
    // fact until then so its text and narration land with the bubble, not before.
    // Later taps fire immediately — the bubble is already visible.
    if (isFirstReveal) {
      LSTween.rawTween(REVEAL_DELAY_MS)
        .onComplete(() => this.fetchCatFacts.getCatFacts())
        .start()
    } else {
      this.fetchCatFacts.getCatFacts()
    }
  }

  // Play animation when the interaction is triggered
  private animateShowingTextBubble() {
    if (this.textBubbleIsShown) return
    this.textBubbleIsShown = true

    // Delay the reveal so it eases in shortly after the tap.
    LSTween.rawTween(REVEAL_DELAY_MS)
      .onComplete(() => {
        // Move the thought bubble from bottom to top
        LSTween.moveFromToLocal(
          this.thoughtBubbleImage.sceneObject.getTransform(),
          new vec3(2, 25, 0),
          new vec3(2, 31, 0),
          500
        )
          .easing(Easing.Cubic.Out)
          .start()

        // Fade in the thought bubble image
        LSTween.alphaTo(this.thoughtBubbleImage.mainMaterial, 1, 600).easing(Easing.Cubic.Out).start()

        // Fade in the thought bubble text
        LSTween.textAlphaTo(this.thoughtBubbleText, 1, 600).easing(Easing.Cubic.Out).start()
      })
      .start()

    // Hide the hint image
    LSTween.alphaTo(this.hintImage.mainMaterial, 0, 300).easing(Easing.Cubic.Out).start()
  }

  private dectivateCat() {
    this.catIsActive = false
    this.animationStateMachine.setTrigger("sleep")
  }

  // Initialize the thought bubble with no alpha
  private initializeThoughtBubble() {
    const imageColorNoAlpha = this.thoughtBubbleImage.mainPass.baseColor
    imageColorNoAlpha.a = 0
    this.thoughtBubbleImage.mainPass.baseColor = imageColorNoAlpha

    const textColorNoAlpha = this.thoughtBubbleText.textFill.color
    textColorNoAlpha.a = 0
    this.thoughtBubbleText.textFill.color = textColorNoAlpha
  }
}
