import "@logseq/libs";
import { PageEntity } from "@logseq/libs/dist/LSPlugin.user";

interface Recipe {
    name: string;
    image: any;
    datePublished: string;
    description: string;
    prepTime: string;
    cookTime: string;
    totalTime: string;
    recipeYield: string;
    recipeIngredient: string[];
    recipeInstructions: any[];
}

// Create function to handle time
const handleRecipeTime = (time: string) => {
    // P0DT0H25M
    time = time.substring(time.indexOf("T") + 1);
    const hrs = time.substring(0, time.indexOf("H"));
    const mins = time.substring(time.indexOf("H") + 1, time.indexOf("M"));
    if (time.startsWith("0") || !time.includes("H")) {
        return `${mins} minutes`;
    } else {
        return `${hrs} hours ${mins} minutes`;
    }
};

export const processRecipe = async (recipe: Recipe) => {
    const {
        name,
        image,
        datePublished,
        description,
        prepTime,
        cookTime,
        totalTime,
        recipeYield,
        recipeIngredient,
        recipeInstructions,
    } = recipe;

    logseq.App.pushState("page", { name: `${name} (Recipe)` });

    const currPage: PageEntity = <PageEntity>(
        await logseq.Editor.getCurrentPage()
    );

    const pagePropertiesArr = [
        { name },
        { description },
        { "prep-time": prepTime ? handleRecipeTime(prepTime) : "" },
        { "cook-time": cookTime ? handleRecipeTime(cookTime) : "" },
        { "total-time": totalTime ? handleRecipeTime(totalTime) : "" },
        { "no-of-servings": recipeYield ? recipeYield : "" },
    ];

    let pageProperties = "";
    pagePropertiesArr.map((a) => {
        pageProperties = `${pageProperties}
${Object.keys(a)}:: "${a[Object.keys(a).toString()]}"`;
    });

    pageProperties = `tags:: [[recipes]]
${pageProperties}`;

    await logseq.Editor.insertBlock(currPage.name, pageProperties, {
        isPageBlock: true,
        before: false,
        sibling: true,
    });

    // insert image
    if (image) {
        if (Array.isArray(image)) {
            if (image[0].url) {
                await logseq.Editor.insertBlock(
                    currPage.name,
                    `![img](${image[0].url
                        .replace("%3A", ":")
                        .replace("%2F", "/")}){:width 500}`,
                    {
                        isPageBlock: true,
                        before: false,
                        sibling: true,
                    }
                );
            } else {
                await logseq.Editor.insertBlock(
                    currPage.name,
                    `![img](${image[0]
                        .replace("%3A", ":")
                        .replace("%2F", "/")}){:width 500}`,
                    {
                        isPageBlock: true,
                        before: false,
                        sibling: true,
                    }
                );
            }
        } else if (image.url) {
            await logseq.Editor.insertBlock(
                currPage.name,
                `![img](${image.url
                    .replace("%3A", ":")
                    .replace("%2F", "/")}){:width 500}`,
                {
                    isPageBlock: true,
                    before: false,
                    sibling: true,
                }
            );
        } else {
            await logseq.Editor.insertBlock(
                currPage.name,
                `![img](${image
                    .replace("%3A", ":")
                    .replace("%2F", "/")}){:width 500}`,
                {
                    isPageBlock: true,
                    before: false,
                    sibling: true,
                }
            );
        }
    }

    // Insert ingredients
    const ingredientsBlk = await logseq.Editor.insertBlock(
        currPage.name,
        "## Ingredients",
        { isPageBlock: true, sibling: true, before: false }
    );

    // Insert instructions
    const instructionsBlk = await logseq.Editor.insertBlock(
        currPage.name,
        "## Instructions",
        { isPageBlock: true, sibling: true, before: false }
    );

    recipeIngredient.map(async (i) => {
        await logseq.Editor.insertBlock(ingredientsBlk.uuid, i, {
            sibling: false,
            before: false,
        });
    });

    recipeInstructions.map(async (i) => {
        await logseq.Editor.insertBlock(instructionsBlk.uuid, i.text, {
            sibling: false,
            before: false,
        });
    });
};
