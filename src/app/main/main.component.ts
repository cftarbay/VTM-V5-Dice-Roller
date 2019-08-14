import { Component } from '@angular/core';

import 'bootstrap';

@Component({
    selector: 'main-comp',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.css']
})
export class MainComponent {

    //array of numbers representing hunger dice results
    //0-5 values from 1-10
    redDice: Array<number> = [];

    //array of numbers representing normal dice results
    //0-20 values from 1-10
    normalDice: Array<number> = [];

    //the user's hunger level, represents the number of dice out of the pool that are hunger dice
    //number between 0-5
    hunger: number = 1;

    //the user's dice pool, the total number of dice to roll
    //number between 1-20
    dice: number = 1;

    //number of successes the user needs to succeed, optional input
    difficulty: number;

    //the total number of successes in hunger and normal result arrays
    successes: number = -1;

    //flag for possible messy critical (two 10s, at least one on a red die)
    messyFlag: boolean = false;

    //flag for possible bestial failure (a 1 on a red die)
    bestialFlag: boolean = false;

    //flag for definite bestial failure (a 1 on a red die and no successes)
    definiteBestialFlag: boolean = false;

    //flag for if difficulty is input and is <1
    difficultyTooLowFlag: boolean = false;

    //list of image paths representing hunger dice results
    redImages: Array<string> = [];

    //list of image paths representing normal dice results
    normalImages: Array<string> = [];

    //flag that becomes true if user tries to roll a dice pool of 0 or less
    tooFewDiceFlag: boolean = false;

    //flag that becomes true if user tries to roll a dice pool with less than 0 hunger dice
    tooFewHungerFlag: boolean = false;

    //flag that becomes true if user tries to roll a dice pool with more than 5 hunger dice
    tooManyHungerFlag: boolean = false;

    //flag representing that dice have been rolled
    rolledFlag: boolean = false;

    //unused image path to show the result of a rouse check
    rouseImg: string = "";

    //unused text to indicate success/failure for a rouse check
    rouseText: string = "";

    //unused array of flavor text when a rouse check is failed
    rouseFails: Array<string> = ["The beast stirs", "The beast snarls", "You get hungrier"]

    //unused array of flavor text when a rouse check succeeds
    rouseSuccesses: Array<string> = ["You're safe", "You hold the beast in check"]

    //indicator for whether is currently in rerolling mode, where they can choose to reroll up to 3 regular dice
    currentlyRerollingFlag: boolean = false;

    //list of booleans marking which indices of normal dice the user has selected to reroll
    rerollList: Array<boolean> = [];

    //the number of normal dice the user has selected to reroll (needs to be 1-3)
    rerollCount: number = 0;

    //flag that becomes true if user tries to select more than 3 dice to willpower reroll
    tooManyRerollFlag: boolean = false;

    //flag that becomes true if user tries to submit reroll with no dice selected to reroll
    noRerollCheckedFlag: boolean = false;

    //becomes true when a user has submitted a reroll, to make sure they cannot reroll again on the same roll
    alreadyRerolledFlag: boolean = false;

    //string to be shown in UI stating result of the roll, if user has input a difficulty
    result: string = "";

    //boolean to keep track of whether difficulty was filled out the last time the user rolled or not
    difficultySetFlag: boolean = false;

    //keeps track of the difficulty set on the last roll, so calculations don't rely on the UI difficulty which could be changed
    difficultyWhenRolled: number;

    constructor() { }

    /**
     * rolls 1d10 and returns result (1-10)
     */
    rollDie(): number {
        return Math.floor(Math.random() * 10) + 1;
    }

    /**
     * rolls the specified number of d10s, stores results in the specified array, and sorts in descending value order
     * @param diceNum the number of dice to roll to fill the array
     * @param array the array to fill with results (numbers 1-10)
     */
    rollArray(diceNum: number, array: Array<number>): void {
        //roll dice
        for (let i = 0; i < diceNum; i++)
            array.push(this.rollDie())

        //sort descending (highest first)
        array.sort(function (a, b) {
            if (a < b)
                return 1;
            else if (a > b)
                return -1;
            else
                return 0;
        })
    }

    /**
     * rolls a full check- the specified number of hunger dice, and the remaining normal dice left from the pool
     */
    rollCheck(): void {
        //empty previous results
        this.redDice = [];
        this.normalDice = [];

        //roll hunger array, number of hunger dice, or pool if pool smaller than hunger
        let rollHunger = this.hunger;
        if (this.dice < this.hunger)
            rollHunger = this.dice;
        this.rollArray(rollHunger, this.redDice);

        //roll remaining non-hunger dice left in pool
        let remainingDice = this.dice - this.hunger;
        this.rollArray(remainingDice, this.normalDice)
    }

    /**
     * currently unused function for making single-die rouse checks
     */
    rouseCheck(): void {
        //fail
        if (this.rollDie() < 6) {
            this.rouseImg = 'assets/images/red-fail.png';
            this.rouseText = 'Fail';
        }
        //success
        else {
            this.rouseImg = 'assets/images/normal-success.png';
            this.rouseText = 'Success';
        }
    }

    /**
     * main function, fully rolls dice arrays and calculates successes/image results
     */
    evaluateResult(): void {
        //reset flags to indicate new roll
        this.rolledFlag = true;
        this.currentlyRerollingFlag = false;
        this.alreadyRerolledFlag = false;

        //check for difficulty set and if so record it
        this.result = ""
        this.difficultySetFlag = false;
        if (this.difficulty) {
            this.difficultySetFlag = true;
            this.difficultyWhenRolled = this.difficulty;
        }

        this.rollCheck();

        this.calculateSuccesses()
    }

    /**
     * checks inputs to see if numbers are valid, if not gives errors, and if so passes on to generate rolls
     */
    validate(): void {
        //keep track of any validation errors
        let noErrors = true;

        //user must have a dice pool of at least one
        if (this.dice < 1) {
            this.tooFewDiceFlag = true;
            noErrors = false;
        }
        else
            this.tooFewDiceFlag = false;

        //user must have 0 or more hunger
        if (this.hunger < 0) {
            this.tooFewHungerFlag = true;
            noErrors = false;
        }
        else
            this.tooFewHungerFlag = false;

        //user must have 5 or less hunger
        if (this.hunger > 5) {
            this.tooManyHungerFlag = true;
            noErrors = false;
        }
        else
            this.tooManyHungerFlag = false;

        //difficulty, if input, must be at least 1
        if (this.difficulty && this.difficulty < 1) {
            this.difficultyTooLowFlag = true;
            noErrors = false;
        }
        else
            this.difficultyTooLowFlag = false;

        //no validation errors, pass to main function
        if (noErrors)
            this.evaluateResult()
    }

    /**
     * count the number of successes due to criticals that have come up
     * two 10s counts as 4 successes instead of just two
     * @param arr the array of numbers to check for double 10s
     */
    findCritSuccesses(arr: Array<number>): number {
        //get number of crits aka double 10s
        let crits = Math.floor(this.countTens(arr) / 2)
        //count 4 successes for every crit
        this.successes += crits * 4
        //flag for messy crit if any crits and any 10s on hunger dice
        this.messyFlag = crits > 0 && this.redDice.includes(10)
        return crits;
    }

    /**
     * counts and returns the number of 10s in the given array of numbers
     * @param dice the array of numbers to count
     */
    countTens(dice: Array<number>): number {
        let count = 0;
        for (let die of dice)
            if (die === 10)
                count++;
        return count;
    }

    /**
     * calculates the number of successes (one for each 6 or above, including doubling for crits)
     */
    calculateSuccesses(): void {
        //reset values for fresh calculation
        this.successes = 0;
        this.bestialFlag = this.redDice.includes(1);

        //find how many crits, if any, the user rolled and begin with that many successes
        let arr = this.redDice.concat(this.normalDice)
        let crits = this.findCritSuccesses(arr)

        //increment successes for each one
        for (let die of arr)
            if (die > 5)
                this.successes++;
        //remove triple-counted crits
        this.successes -= crits * 2

        //if no successes and a 1 on any hunger dice, flag for definite bestial fail
        this.definiteBestialFlag = this.redDice.includes(1) && this.successes === 0;

        this.createImgArrays();

        //if difficulty is set, determine definitive outcome of roll
        if (this.difficulty)
            this.setResultText();
    }

    /**
     * sets a string to the success/failure state of the roll, to be displayed in UI
     */
    setResultText(): void {
        let success = false
        if (this.successes >= this.difficultyWhenRolled)
            success = true;
        if (success && this.messyFlag)
            this.result = 'Messy Critical';
        else if (success)
            this.result = "Success"
        else if (this.bestialFlag || this.definiteBestialFlag)
            this.result = 'Bestial Failure'
        else
            this.result = "Failure"
    }

    /**
     * fill arrays of red/black dice result images based on numbers rolled
     */
    createImgArrays(): void {
        //clear image arrays
        this.redImages = [];
        this.normalImages = [];

        //process list of hunger dice results
        for (let die of this.redDice)
            if (die === 1)
                this.pushImage('bestial-fail', this.redImages);
            else if (die < 6)
                this.pushImage('red-fail', this.redImages);
            else if (die < 10)
                this.pushImage('red-success', this.redImages);
            else
                this.pushImage('red-crit', this.redImages);

        //process list of normal dice results
        for (let die of this.normalDice)
            if (die < 6)
                this.pushImage('normal-fail', this.normalImages);
            else if (die < 10)
                this.pushImage('normal-success', this.normalImages);
            else
                this.pushImage('normal-crit', this.normalImages);
    }

    /**
     * pushes the specified image path onto the specified array
     * @param name the name of the image to add
     * @param arr the array of image paths to add on to
     */
    pushImage(name: string, arr: Array<string>): void {
        arr.push('assets/images/' + name + '.png');
    }

    /**
     * initiates willpower reroll mode
     */
    willpowerReroll(): void {
        //indicate we are rerolling, but no dice have been chosen to reroll yet
        this.currentlyRerollingFlag = true;
        this.rerollList = [];
        this.rerollCount = 0;
        this.noRerollCheckedFlag = false;
        this.tooManyRerollFlag = false;
        for (let i = 0; i < this.normalDice.length; i++)
            this.rerollList.push(false);
    }

    /**
     * sets the normal die at the provided index to be rerolled or not based on user click toggle, if allowed
     * @param ind the index of the die the user wants to set for rerolling or not
     */
    checkForReroll(ind: number): void {
        //if the die is already set to be rolled and the user clicked it, unset
        if (this.rerollList[ind]) {
            this.rerollList[ind] = false;
            this.rerollCount--;
        }
        //if the die isn't already set to be rerolled
        else {
            //if too many already chosen, set flag and reject
            if (this.rerollCount === 3)
                this.tooManyRerollFlag = true;
            //if not, select it and increment counter
            else {
                this.noRerollCheckedFlag = false;
                this.rerollList[ind] = true;
                this.rerollCount++;
            }
        }
    }

    /**
     * user wants to reroll the normal dice they have selected
     */
    confirmReroll(): void {
        //if none chosen, reject and show error
        if (this.rerollCount === 0)
            this.noRerollCheckedFlag = true;
        //if 1-3 chosen
        else {
            //reroll those at indicated indices
            for (let i = 0; i < this.rerollList.length; i++) {
                if (this.rerollList[i])
                    this.normalDice[i] = this.rollDie();
            }
            //recalculate number of successes and switch out images if necessary
            this.calculateSuccesses();
            //set that we have ended the reroll
            this.currentlyRerollingFlag = false;
            this.alreadyRerolledFlag = true;
        }
    }
}