import { Button, Input, Loader, TextArea } from '@openfun/cunningham-react';
import { marked } from 'marked';
import { useState } from 'react';
import { ButtonProps } from 'react-aria-components';
import styled from 'styled-components';

import { fetchAPI } from '@/api';
import { Box, Text } from '@/components';
import { Doc } from '@/features/docs';

import { useEditorStore } from '../../stores/useEditorStore';

export const AIButtonEl = styled.button`
  background-image: url('/assets/ia_baguette.png');
  background-size: cover;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background-color: transparent;
`;

export const SuggestionButton = styled.button`
  display: flex;
  align-items: center;
  border: none;
  cursor: pointer;
  background-color: white;
  color: var(--c--theme--colors--greyscale-900);
  height: 32px;
  padding: 0 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  &:hover,
  &:focus {
    background-color: var(--c--theme--colors--greyscale-100);
  }

  span.material-icons {
    margin-right: 4px;
  }

  span.sub {
    color: var(--c--theme--colors--greyscale-600);
    margin-left: 4px;
    font-weight: 500;
  }
`;

export const AiButton = ({ doc }: { doc: Doc }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <Box
        $position="absolute"
        $css={`
        right: 0;
        bottom: 0;
        padding: 1rem;
        margin: 1rem;
        z-index: 1;
        
        `}
      >
        <AIButtonEl
          aria-label="Ask anything to our AI"
          onClick={() => setIsOpen(true)}
        />
      </Box>

      <AiChat doc={doc} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const AiChat = (props: { isOpen: boolean; onClose: () => void; doc: Doc }) => {
  const [prompt, setPrompt] = useState('');
  const { editor } = useEditorStore();
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);

  if (!props.isOpen) {
    return null;
  }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editor) {
      return;
    }

    setIsLoading(true);
    setMessages([...messages, { role: 'user', content: prompt }]);
    setPrompt(''); // Clear the prompt after submitting the form

    const editorContentFormatted = await editor.blocksToMarkdownLossy();

    console.log('submit', e, prompt);
    console.log('editorContentFormatted', editorContentFormatted);

    const response = await fetchAPI(`documents/${props.doc.id}/ai-proxy/`, {
      method: 'POST',
      body: JSON.stringify({
        system:
          'You are a helpful assistant. You are given a text in markdown format and you need to answer the question. Here is the text: ' +
          editorContentFormatted,
        text: prompt,
      }),
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await response.json();

    console.log('response', data);
    setMessages((messages) => [
      ...messages,
      { role: 'assistant', content: data },
    ]);
    setIsLoading(false);
  };

  return (
    <Box
      $position="absolute"
      $css={`
        right: 0;
        bottom: 0;
        padding: 1rem;
        width: 450px;
        min-height: min(61vh, 365px);
            box-shadow: rgba(15, 15, 15, 0.04) 0px 0px 0px 1px, rgba(15, 15, 15, 0.03) 0px 3px 6px, rgba(15, 15, 15, 0.06) 0px 9px 24px;
        max-height: max(-180px + 100vh, 365px);
        overflow-y: auto;
        border-radius: 16px;
        background-color: white;
        margin: 1rem;
        z-index: 2;
      `}
      $direction="column"
    >
      <Box $direction="row" $align="center" $justify="space-between">
        <Text $theme="greyscale" $variation="1000" $weight="bold" $size="s">
          {messages.length == 0 ? '' : 'Demander à Albert'}
        </Text>
        <Button
          size="small"
          onClick={props.onClose}
          color="tertiary-text"
          icon={<span className="material-icons">close</span>}
        />
      </Box>
      {messages.length == 0 && (
        <Box $gap="1rem" $position="relative" $css="top: -24px;">
          <Box $gap="0.5rem">
            <Box
              $css={`
            background-image: url('/assets/ia_baguette_question_mark.png');
            background-size: cover;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            `}
            ></Box>
            <Text $theme="primary" $variation="800">
              Bonjour, comment puis-je vous aider ?
            </Text>
          </Box>
          <Box $gap="0.5rem">
            <Text $theme="greyscale" $variation="1000" $weight="bold" $size="s">
              Suggestions
            </Text>
            <Box>
              <SuggestionButton>
                <span className="material-icons">description</span>
                Résumer <span className="sub">cette page</span>
              </SuggestionButton>
              <SuggestionButton>
                <span className="material-icons">help_center</span>
                Poser des questions <span className="sub">surcette page</span>
              </SuggestionButton>
            </Box>
          </Box>
        </Box>
      )}
      <Box
        $flex={1}
        $direction="column"
        $gap="1rem"
        $css={`
      overflow-y: auto;
      font-size: 14px;
          mask-image: linear-gradient(black calc(100% - 32px), transparent calc(100% - 4px));
          padding-bottom: 32px;
`}
      >
        {messages.map((message, index) => {
          if (message.role === 'user') {
            return (
              <Box
                key={index}
                $css={`
                border-radius: 16px;
                padding: 6px 14px;
                background-color: rgba(55, 53, 47, 0.04);
                ${message.role === 'user' ? 'margin-left: auto;' : ''}
              `}
              >
                {message.content}
              </Box>
            );
          }
          return (
            <Box
              key={index}
              dangerouslySetInnerHTML={{
                __html: marked.parse(message.content),
              }}
            ></Box>
          );
        })}

        {(isLoading || false) && (
          <Box $display="flex" $direction="row" $align="center" $gap="0.5rem">
            <Loader size="small" />
            Thinking ...
          </Box>
        )}
      </Box>
      <Box>
        <form onSubmit={(e) => void submit(e)} style={{ width: '100%' }}>
          <Input
            type="text"
            label="Posez votre question"
            name="prompt"
            fullWidth={true}
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt} // Ensure the input value is updated with the state
            rightIcon={<span className="material-icons">send</span>}
          />
        </form>
      </Box>
    </Box>
  );
};
