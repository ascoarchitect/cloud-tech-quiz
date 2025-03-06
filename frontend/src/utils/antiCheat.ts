/**
 * Anti-cheating module for the Cloud Skills Assessment application
 * This module implements various anti-cheating measures:
 * 1. Detecting window/tab focus changes (to prevent searching for answers)
 * 2. Detecting browser developer tools usage
 * 3. Detecting copy/paste operations
 * 4. Tracking suspicious rapid answering patterns
 */

// Event callback types
type CheatDetectionCallback = (reason: string) => void;
type WarningCallback = (reason: string) => void;
type DisqualificationCallback = (reason: string) => void;

interface AntiCheatOptions {
  maxWarnings?: number;
  maxFocusChanges?: number;
  maxTimeAwayMs?: number;
  disqualifyAfterDetection?: boolean;
  testId?: string;
}

class AntiCheatModule {
  private detectionCallback: CheatDetectionCallback;
  private warningCallback: WarningCallback;
  private disqualificationCallback: DisqualificationCallback;
  private testId: string;
  private warningCount: number = 0;
  private maxWarnings: number = 2; // Number of warnings before triggering cheat detection
  private lastFocusTime: number = 0;
  private focusChangeCount: number = 0;
  private maxFocusChanges: number = 3; // Maximum number of tab switches allowed
  private maxTimeAwayMs: number = 10000; // Maximum time away in milliseconds (10 seconds)
  private disqualifyAfterDetection: boolean = true; // Whether to auto-disqualify after cheat detection
  private isDisqualified: boolean = false;
  private eventListeners: Array<{
    target: EventTarget;
    type: string;
    listener: EventListener;
  }> = [];

  constructor(
    detectionCallback: CheatDetectionCallback,
    warningCallback: WarningCallback,
    disqualificationCallback: DisqualificationCallback,
    options?: AntiCheatOptions,
  ) {
    this.detectionCallback = detectionCallback;
    this.warningCallback = warningCallback;
    this.disqualificationCallback = disqualificationCallback;

    // Get options with defaults
    if (options) {
      if (options.maxWarnings !== undefined)
        this.maxWarnings = options.maxWarnings;
      if (options.maxFocusChanges !== undefined)
        this.maxFocusChanges = options.maxFocusChanges;
      if (options.maxTimeAwayMs !== undefined)
        this.maxTimeAwayMs = options.maxTimeAwayMs;
      if (options.disqualifyAfterDetection !== undefined)
        this.disqualifyAfterDetection = options.disqualifyAfterDetection;
    }

    // Set testId with a default
    this.testId = options?.testId || "unknown";

    this.lastFocusTime = Date.now();
  }

  /**
   * Start monitoring for potential cheating behavior
   */
  public start(): void {
    // Monitor window focus changes
    this.addEventHandler(window, "blur", this.handleFocusChange.bind(this));
    this.addEventHandler(window, "focus", this.handleFocusChange.bind(this));

    // Monitor copy/paste events
    this.addEventHandler(document, "copy", this.preventCopyPaste.bind(this));
    this.addEventHandler(document, "paste", this.preventCopyPaste.bind(this));
    this.addEventHandler(document, "cut", this.preventCopyPaste.bind(this));

    // Detect right-click (context menu)
    this.addEventHandler(
      document,
      "contextmenu",
      this.preventContextMenu.bind(this),
    );

    // Detect print attempts
    this.addEventHandler(
      window,
      "beforeprint",
      this.handlePrintAttempt.bind(this),
    );

    // Attempt to detect devtools (not foolproof, but adds a layer of deterrence)
    this.setupDevToolsDetection();

    console.log("Anti-cheat monitoring started");
  }

  /**
   * Stop all monitoring and clean up event listeners
   */
  public stop(): void {
    // Remove all registered event listeners
    this.eventListeners.forEach(({ target, type, listener }) => {
      target.removeEventListener(type, listener);
    });
    this.eventListeners = [];

    console.log("Anti-cheat monitoring stopped");
  }

  /**
   * Check if the user has been disqualified
   */
  public isUserDisqualified(): boolean {
    return this.isDisqualified;
  }

  /**
   * Add an event handler and track it for later cleanup
   */
  private addEventHandler(
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions,
  ): void {
    target.addEventListener(type, listener, options);
    this.eventListeners.push({ target, type, listener });
  }

  /**
   * Handle window focus changes (detecting if user switches tabs/windows)
   */
  private handleFocusChange(event: Event): void {
    if (this.isDisqualified) return;

    const currentTime = Date.now();

    if (event.type === "blur") {
      // User has switched away from the test
      this.lastFocusTime = currentTime;
      this.focusChangeCount++;

      if (this.focusChangeCount > this.maxFocusChanges) {
        this.triggerWarning(
          "Multiple tab switches detected. Please stay in the test window.",
        );

        // Auto-disqualify for excessive tab switching
        if (this.focusChangeCount > this.maxFocusChanges * 2) {
          this.triggerDisqualification(
            "Test terminated due to excessive tab/window switching.",
          );
        }
      }
    } else if (event.type === "focus") {
      // User has returned to the test
      const timeAway = currentTime - this.lastFocusTime;

      // If they were away for more than the allowed time, it's suspicious
      if (timeAway > this.maxTimeAwayMs && this.lastFocusTime > 0) {
        const secondsAway = Math.round(timeAway / 1000);
        this.triggerWarning(
          `Test window was inactive for ${secondsAway} seconds.`,
        );

        // Auto-disqualify for being away too long (likely searching for answers)
        if (timeAway > this.maxTimeAwayMs * 3) {
          this.triggerDisqualification(
            `Test terminated due to extended absence (${secondsAway} seconds).`,
          );
        }
      }
    }
  }

  /**
   * Prevent copy/paste operations
   */
  private preventCopyPaste(event: Event): void {
    if (this.isDisqualified) return;

    event.preventDefault();
    this.triggerWarning(
      "Copy/paste operations are not allowed during the test.",
    );
  }

  /**
   * Prevent context menu (right-click)
   */
  private preventContextMenu(event: Event): void {
    if (this.isDisqualified) return;

    event.preventDefault();
    this.triggerWarning("Right-clicking is disabled during the test.");
  }

  /**
   * Handle print attempts
   */
  private handlePrintAttempt(_: Event): void {
    if (this.isDisqualified) return;

    this.triggerWarning("Printing is not allowed during the test.");
  }

  /**
   * Attempt to detect developer tools usage
   * Note: This is not foolproof, but serves as a deterrent
   */
  private setupDevToolsDetection(): void {
    // Method 1: Check for changes in window dimensions (can trigger when dev tools opened)
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    this.addEventHandler(window, "resize", () => {
      if (this.isDisqualified) return;

      const widthChange = Math.abs(windowWidth - window.innerWidth);
      const heightChange = Math.abs(windowHeight - window.innerHeight);

      // If dimensions change significantly (possible devtools panel opening)
      if ((widthChange > 200 || heightChange > 200) && document.hasFocus()) {
        this.triggerWarning("Suspicious window resizing detected.");
      }

      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;
    });
  }

  /**
   * Trigger a warning to the user
   */
  private triggerWarning(reason: string): void {
    if (this.isDisqualified) return;

    this.warningCallback(reason);
    this.warningCount++;

    if (this.warningCount >= this.maxWarnings) {
      this.triggerCheatDetection(reason);
    }
  }

  /**
   * Trigger the cheat detection callback
   */
  private triggerCheatDetection(reason: string): void {
    if (this.isDisqualified) return;

    this.detectionCallback(reason);

    if (this.disqualifyAfterDetection) {
      this.triggerDisqualification(
        `Test terminated due to suspicious activity: ${reason}`,
      );
    }
  }

  /**
   * Trigger disqualification and end the test
   */
  private triggerDisqualification(reason: string): void {
    if (this.isDisqualified) return;

    this.isDisqualified = true;
    this.disqualificationCallback(reason);

    // Store with test-specific key
    try {
      localStorage.setItem(`testDisqualified_${this.testId}`, "true");
      localStorage.setItem(`disqualificationReason_${this.testId}`, reason);
    } catch (e) {
      // Ignore storage errors
    }
  }
}

export default AntiCheatModule;
