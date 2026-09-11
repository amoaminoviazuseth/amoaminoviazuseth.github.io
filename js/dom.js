export const elements = {
    get scenes() { return [...document.querySelectorAll(".scene")]; },
    get soundGate() { return document.querySelector("#soundGate"); },
    get startExperience() { return document.querySelector("#startExperience"); },
    get invitation() { return document.querySelector("#invitation"); },
    get mouseTracks() { return document.querySelector("#mouseTracks"); },
    get littleDoor() { return document.querySelector("#littleDoor"); },
    get doorHint() { return document.querySelector("#doorHint"); },
    
    get scene2() { return document.querySelector("#scene2"); },
    get tunnelProgress() { return document.querySelector("#tunnelProgress"); },
    get leftHand() { return document.querySelector("#leftHand"); },
    get rightHand() { return document.querySelector("#rightHand"); },
    get whisper() { return document.querySelector("#whisper"); },
    
    get scene3() { return document.querySelector("#scene3"); },
    get rider() { return document.querySelector("#rider"); },
    get mask() { return document.querySelector("#mask"); },
    get dialogueText() { return document.querySelector("#dialogueText"); },
    get dialogueNext() { return document.querySelector("#dialogueNext"); },
    get thrownTalisman() { return document.querySelector("#thrownTalisman"); },
    
    get scene4() { return document.querySelector("#scene4"); },
    get room() { return document.querySelector(".room"); },
    get lens() { return document.querySelector("#lens"); },
    get dragTalisman() { return document.querySelector("#dragTalisman"); },
    get hiddenButtons() { return [...document.querySelectorAll(".hidden-button")]; },
    get buttonCount() { return document.querySelector("#buttonCount"); },
    get dangerBar() { return document.querySelector("#dangerBar"); },
    get gameOver() { return document.querySelector("#gameOver"); },
    get retryGame() { return document.querySelector("#retryGame"); },
    
    get candles() { return document.querySelector("#candles"); },
    get wishButton() { return document.querySelector("#wishButton"); },
    get starDust() { return document.querySelector("#starDust"); },
    get letterModal() { return document.querySelector("#letterModal"); },
    get letterText() { return document.querySelector("#letterText"); },
    get signature() { return document.querySelector("#signature"); },
    get replay() { return document.querySelector("#replay"); },
    get whiteFlash() { return document.querySelector("#whiteFlash"); },
    
    get musicaFondo() { return document.getElementById('musicaFondo'); },
    get audioSusurros() { return document.getElementById('audioSusurros'); },
    
    get fireflyContainer() { return document.querySelector("#fireflies"); },
    get flowerBed() { return document.querySelector("#flowerBed"); }
};
