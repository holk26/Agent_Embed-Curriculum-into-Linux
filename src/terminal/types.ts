export interface CommandResult {
  type: 'output' | 'error' | 'navigate';
  content: string;
  navigateTo?: string;
  newDir?: string;
  theme?: string;
}

export type CommandHandler = (
  args: string[],
  currentDir: string,
  historyList?: string[]
) => CommandResult;

export interface Line {
  id: string;
  type: 'command' | 'output' | 'error';
  content: string;
  commandName?: string;
}
