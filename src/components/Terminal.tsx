import React, { useEffect, useRef } from 'react';
import type { Terminal as XTermInstance } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';

type CommandHandler = () => readonly string[];

const PROMPT = '\x1b[36mshelcorp\x1b[0m:\x1b[90m~\x1b[0m$ ';

const bootLines = [
  'Shelcorp operator console v0.4.2',
  'Type `help` to inspect available systems.',
  '',
] as const;

const commandHandlers: Record<string, CommandHandler> = {
  help: () => [
    'available commands:',
    '  status       summarize live service posture',
    '  products     list public developer tools',
    '  contacts     show routing aliases',
    '  deploy       print deployment procedure',
    '  clear        clear terminal scrollback',
  ],
  status: () => [
    'site:        operational',
    'database:    configured · postgres/drizzle',
    'graph:       dependencies installed · workflow pending',
    'deploy:      source-of-truth is github.com/shel-corp/shel-web',
  ],
  products: () => [
    'branch-state-manager      branch-specific config + artifacts',
    'pull-request-generator    structured PR and commit drafting',
    'workflow-metrics          development workflow telemetry',
  ],
  contacts: () => [
    'support@shelcorp.com',
    'docs-integrity@shelcorp.com',
    'systems-research@shelcorp.com',
    'sre@shelcorp.com',
  ],
  deploy: () => [
    'ssh shelcorp-vps',
    'cd /opt/shelcorp/shel-web',
    './deploy.sh',
  ],
};

function normalizeCommand(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function runCommand(command: string): readonly string[] {
  if (!command) {
    return [];
  }

  if (command === 'clear') {
    return ['__CLEAR__'];
  }

  const handler = commandHandlers[command];

  if (handler) {
    return handler();
  }

  return [`command not found: ${command}`, 'try `help`'];
}

export default function Terminal() {
  const terminalHost = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cleanupTerminal: (() => void) | undefined;
    let disposed = false;

    async function mountTerminal() {
      const host = terminalHost.current;

      if (!host) {
        return;
      }

      const { Terminal: XTerm } = await import('@xterm/xterm');
      const terminal: XTermInstance = new XTerm({
        allowProposedApi: false,
        convertEol: true,
        cursorBlink: true,
        cursorStyle: 'block',
        disableStdin: false,
        fontFamily: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace',
        fontSize: 14,
        lineHeight: 1.25,
        rows: 16,
        scrollback: 500,
        theme: {
          background: '#070909',
          black: '#0B0D0E',
          blue: '#3A7AFE',
          brightBlack: '#5F666B',
          brightBlue: '#78A4FF',
          brightCyan: '#8CF7F7',
          brightGreen: '#A8FFB1',
          brightMagenta: '#ECA0FF',
          brightRed: '#FF6B61',
          brightWhite: '#F2F4F5',
          brightYellow: '#FFE08A',
          cursor: '#4DE3E3',
          cyan: '#4DE3E3',
          foreground: '#DDE3E5',
          green: '#69D17D',
          magenta: '#C98BFF',
          red: '#C6362E',
          selectionBackground: '#24464A',
          white: '#DDE3E5',
          yellow: '#C9A449',
        },
      });

      if (disposed) {
        terminal.dispose();
        return;
      }

      let input = '';
      let history: string[] = [];
      let historyIndex = 0;

      const writePrompt = () => terminal.write(PROMPT);

      const replaceInput = (value: string) => {
        terminal.write('\x1b[2K\r');
        terminal.write(PROMPT);
        terminal.write(value);
        input = value;
      };

      const executeInput = () => {
        const command = normalizeCommand(input);
        terminal.write('\r\n');

        if (command) {
          history = [...history, command].slice(-30);
          historyIndex = history.length;
        }

        const output = runCommand(command);

        if (output[0] === '__CLEAR__') {
          terminal.clear();
        } else {
          output.forEach((line) => terminal.writeln(line));
        }

        input = '';
        writePrompt();
      };

      terminal.open(host);
      terminal.focus();
      bootLines.forEach((line) => terminal.writeln(line));
      writePrompt();

      const dataSubscription = terminal.onData((data) => {
        if (data === '\r') {
          executeInput();
          return;
        }

        if (data === '\u007F') {
          if (input.length > 0) {
            input = input.slice(0, -1);
            terminal.write('\b \b');
          }
          return;
        }

        if (data === '\u0003') {
          terminal.write('^C\r\n');
          input = '';
          writePrompt();
          return;
        }

        if (data === '\u000c') {
          terminal.clear();
          input = '';
          writePrompt();
          return;
        }

        if (data === '\x1b[A') {
          if (history.length > 0) {
            historyIndex = Math.max(0, historyIndex - 1);
            replaceInput(history[historyIndex] ?? '');
          }
          return;
        }

        if (data === '\x1b[B') {
          if (history.length > 0) {
            historyIndex = Math.min(history.length, historyIndex + 1);
            replaceInput(history[historyIndex] ?? '');
          }
          return;
        }

        if (data >= ' ' && data !== '\x7f') {
          input += data;
          terminal.write(data);
        }
      });

      const resizeObserver = new ResizeObserver(() => {
        const currentHost = terminalHost.current;
        if (!currentHost) {
          return;
        }

        const availableColumns = Math.max(40, Math.floor((currentHost.clientWidth - 24) / 8));
        terminal.resize(Math.min(100, availableColumns), 16);
      });

      resizeObserver.observe(host);

      cleanupTerminal = () => {
        resizeObserver.disconnect();
        dataSubscription.dispose();
        terminal.dispose();
      };
    }

    void mountTerminal();

    return () => {
      disposed = true;
      cleanupTerminal?.();
    };
  }, []);

  return (
    <section className="terminal-section" aria-labelledby="terminal-heading">
      <div className="terminal-copy">
        <p className="eyebrow">Operator interface</p>
        <h2 id="terminal-heading">A real terminal surface, safely simulated.</h2>
        <p>
          Built on the same open-source terminal engine used by VS Code, this console gives the
          site a proper emulator frame without exposing a server shell.
        </p>
      </div>
      <div className="terminal-frame" role="application" aria-label="Shelcorp simulated terminal emulator">
        <div className="terminal-titlebar" aria-hidden="true">
          <span />
          <span />
          <span />
          <strong>shelcorp-console</strong>
        </div>
        <div ref={terminalHost} className="terminal-host" />
      </div>
    </section>
  );
}
