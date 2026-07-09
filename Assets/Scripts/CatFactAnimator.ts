import {LSTween} from "LSTween.lspkg/LSTween"
import Easing from "LSTween.lspkg/TweenJS/Easing"
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {FetchCatFacts} from "./FetchCatFacts"

const TEXT_SLEEPING = "むにゃ… おひるね中だにゃ。またあとで来てにゃ！"
const TEXT_ACTIVE = "にゃー！おかえり！猫の豆知識を話すにゃ！"

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
    if (!this.catIsActive) {
      this.catIsActive = true
      this.hasBeenActivatedOnce = true

      this.animateShowingTextBubble()

      this.animationStateMachine.setTrigger("stand")
    }

    // Fetch cat facts when interaction is triggered
    if (fetchFacts) {
      this.fetchCatFacts.getCatFacts()
    }
  }

  // Play animation when the interaction is triggered
  private animateShowingTextBubble() {
    if (this.textBubbleIsShown) return
    this.textBubbleIsShown = true

    // Delay the animation for 1.5 seconds
    LSTween.rawTween(1500)
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
