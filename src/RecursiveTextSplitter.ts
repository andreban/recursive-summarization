async function countTokens(languageModel: AILanguageModel, input: string): Promise<number> {
    const tokenCount = await languageModel.countPromptTokens(input);
    console.log(`${input} => Token count: ${tokenCount}`);
    return languageModel.countPromptTokens(input);
}

export async function splitText(
    languageModel: AILanguageModel,
    input: string,
    maxTokens: number,
    patterns: string[] = ['\n#', '\n##', '\n###', '\n\n\n','\n\n', '\n', '.', ' '],
    patternIndex: number = 0,
): Promise<string[]> {
    // Ran out of patterns, can't split the text further.
    if (patternIndex >= patterns.length) {
        return [input];
    }

    // Check if the input needs to be split.
    const tokenCount = await countTokens(languageModel, input);
    if (tokenCount <= maxTokens) {
        return [input];
    }

    // Split the text based on the current pattern.
    const splits = input.split(patterns[patternIndex]);
    let result = new Array<string>();

    // Recursively split each split.
    for (let split of splits) {
        const splittedSplit = await splitText(languageModel, split, maxTokens, patterns, patternIndex + 1);
        result.push(...splittedSplit);
    }
    return result;
}