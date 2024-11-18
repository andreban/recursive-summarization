import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import TokenCounter from './TokenCounter';

const MAX_TOKENS: number = 800;

const aiSpinner = document.getElementById('ai-spinner') as HTMLDivElement;
const inputTextArea = document.getElementById('input') as HTMLTextAreaElement;
const outputTextArea = document.getElementById('output') as HTMLTextAreaElement;
const button = document.getElementById('split-it') as HTMLButtonElement;

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 3000,
    chunkOverlap: 200,
});

const tokenCounter = await TokenCounter.create();
const summarizer = await window.ai.summarizer.create({
    format: 'plain-text',
    type: 'tl;dr',
    length: 'long',
});

async function recursiveSummarizer(parts: string[]) {
    console.log(`Summarizing ${parts.length} parts.`)
    let summaries: string[] = [];
    let currentSummary: string[] = [];
    for (let i = 0; i < parts.length; i++) {
        console.log(`Summarizing part ${i + 1} of ${parts.length}.`)
        const summarizedPart = await summarizer.summarize(parts[i].trim());
        if (await tokenCounter.countTokens([...currentSummary, summarizedPart].join('\n')) > MAX_TOKENS) {
            summaries.push(currentSummary.join('\n'));
            currentSummary = [summarizedPart];
        } else {
            currentSummary.push(summarizedPart);
        }
    }
    summaries.push(currentSummary.join('\n'));
    if (summaries.length == 1) {
        return await summarizer.summarize(summaries[0]);
    }
    return recursiveSummarizer(summaries);
}

button.addEventListener('click', async () => {
    aiSpinner.classList.add('visible');
    const splits = await splitter.splitText(inputTextArea.value);
    console.log(`Split into ${splits.length} parts.`)
    const summary = await recursiveSummarizer(splits);
    console.log(`Summary: ${summary}`);
    outputTextArea.value = summary;
    aiSpinner.classList.remove('visible');
});

