import { getCookie, setCookie } from "typescript-cookie";
import { type Ball } from "./balls";
const cookieName = "user-completion";

export function addCompletion(newBall: Ball, completionList: Array<Ball>): Array<Ball>{
    const existingEntries = completionList.filter(b => newBall.name == b.name);
    if(existingEntries.length){
        console.warn("Ball already exists in completion list, ignoring.");
    } else {
        completionList.push(newBall);
    }
    return completionList;
}

export function removeCompletion(removeBall: Ball, completionList: Array<Ball>): Array<Ball>{
    return completionList.filter(b => removeBall.name != b.name);
}

export function saveCompletionBalls(data: Array<Ball>){
    setCookie(cookieName, JSON.stringify(data.map(e => e.name)) );
}

export function loadCompletion(allBalls: Array<Ball>): Array<Ball>{
    let response: Array<Ball> = [];
    const cookieData = getCookie(cookieName);
    if(cookieData) {
        const stringArray = JSON.parse(cookieData);
        response = allBalls.filter(b => stringArray.includes(b.name));
    }
    return response;
}