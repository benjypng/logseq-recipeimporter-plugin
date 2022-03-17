import React, { useState } from "react";
import "./App.css";
import axios from "axios";
import { parse } from "node-html-parser";
import { processRecipe } from "./processRecipe";

const App = () => {
    const [recipeUrl, setRecipeUrl] = useState("");

    const handleForm = (e: any) => {
        setRecipeUrl(e.target.value);
    };

    const handleSubmit = async (e: any) => {
        if (e.key !== "Enter") {
            return;
        } else if (e.key === "Enter") {
            try {
                const response = await axios.get(recipeUrl.trim());

                const root = parse(response.data);
                const text = root.querySelector(
                    'script[type="application/ld+json"]'
                ).text;
                let json = JSON.parse(text);

                // if json is an object
                if (json["@graph"]) {
                    json = json["@graph"];
                }

                if (json.length > 0) {
                    json.map((i) => {
                        if (i["@type"] === "Recipe") json = i;
                    });
                }

                logseq.hideMainUI();
                setRecipeUrl("");
                await processRecipe(json);
            } catch (e) {
                console.log(e);
                logseq.App.showMsg(
                    "Apologies, the URL does not contain a valid recipe to parse.",
                    "error"
                );
                setRecipeUrl("");
                return;
            }
        }
    };

    return (
        <div
            className="task-container flex justify-center border border-black"
            tabIndex={-1}
        >
            <div className=" absolute top-10 bg-white rounded-lg p-3 w-2/3 border flex flex-col">
                <input
                    className="task-field appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                    type="text"
                    placeholder="Enter the url of the page of your recipe."
                    aria-label="Recipe URL"
                    name="recipeUrl"
                    onChange={handleForm}
                    value={recipeUrl}
                    onKeyDown={(e) => handleSubmit(e)}
                />
            </div>
        </div>
    );
};

export default App;
