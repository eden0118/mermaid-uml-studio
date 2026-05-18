export const DEFAULT_MERMAID_CODE = `graph TD
    A[Start] --> B{Is it working?}
    B -- Yes --> C[Great!]
    B -- No --> D[Debug]
    D --> B`;

export const DEFAULT_MARKDOWN_CODE = `# Markdown Syntax Guide

Welcome to the editor! Here is a quick overview of the supported syntax.

## Typography

You can use **bold text**, *italic text*, and ~~strikethrough~~.

## Headings

# H1 Heading
## H2 Heading
### H3 Heading

## Lists & Tasks

1. Ordered list item
2. Another item
   * Sub-item
   * Another sub-item

* Unordered list item
* Another item

- [x] Task completed
- [ ] Task pending
- [ ] Another task

## Blockquotes

> "The best way to predict the future is to invent it."
> — Alan Kay

## Code Blocks

Inline code looks like \`const a = 1;\`.

Block code with syntax highlighting:

\`\`\`typescript
interface User {
  id: number;
  name: string;
}

const user: User = {
  id: 1,
  name: "Alice"
};
\`\`\`

## Tables

| Feature | Support | Status |
| :--- | :---: | ---: |
| Markdown | Yes | ✅ |
| Mermaid | Yes | ✅ |
| Tables | Yes | ✅ |

## Links & Images

[Google](https://google.com)

![Placeholder Image](https://via.placeholder.com/150x50?text=Hello+Image)

## Mermaid Diagrams

You can embed diagrams directly using the \`mermaid\` fence:

\`\`\`mermaid
graph LR
    A[Hard Work] -->|leads to| B(Success)
    B --> C{Happy?}
    C -- Yes --> D[Keep Going]
    C -- No --> E[Try Something Else]
\`\`\`
`;

export const UML_TEMPLATES = [
  {
    name: 'Flowchart',
    code: DEFAULT_MERMAID_CODE,
  },
  {
    name: 'Sequence Diagram',
    code: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!`,
  },
  {
    name: 'State Diagram',
    code: `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`,
  },
  {
    name: 'Class Diagram',
    code: `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
      +String beakColor
      +swim()
      +quack()
    }
    class Fish{
      -int sizeInFeet
      -canEat()
    }
    class Zebra{
      +bool is_wild
      +run()
    }`,
  },
  {
    name: 'ER Diagram',
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER }|..|{ DELIVERY-ADDRESS : uses`,
  },
  {
    name: 'Gantt Chart',
    code: `gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2014-01-01, 30d
    Another task     :after a1  , 20d
    section Another
    Task in sec      :2014-01-12  , 12d
    another task      : 24d`,
  },
  {
    name: 'Pie Chart',
    code: `pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15`,
  },
  {
    name: 'Mindmap',
    code: `mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness<br/>and features
      On Automatic creation
        Uses
            Creative techniques
            Strategic planning
            Argument mapping`,
  },
];

export const MARKDOWN_MIME = 'text/markdown';
