# Excel Matcher

A Next.js application for matching and comparing data from two Excel files and exporting the results in various text formats.

## Features

- Upload and process two Excel files
- Match data between files based on specific columns
- Preview matched data with a tabular interface
- Export data in multiple text formats:
  - Lista de Produtos ATUAIS.txt
  - estoque_list.txt
  - Conferência Ok.txt
- Download all files as a ZIP archive
- Preview file contents before downloading

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/excel-matcher.git
cd excel-matcher
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Dependencies

- Next.js
- React
- xlsx (for Excel file processing)
- jszip (for creating ZIP archives)
- Tailwind CSS (for styling)
- shadcn/ui components
- Lucide React (for icons)

## Usage

1. Upload the first Excel file containing the EXTRAINF02 column
2. Upload the second Excel file containing the Cód. Produto column
3. Click "Comparar Arquivos" to process the files
4. View the matched data in the results table
5. Preview the different export formats in the tabs
6. Download individual files or all files as a ZIP archive

## License

This project is licensed under the MIT License - see the LICENSE file for details.
