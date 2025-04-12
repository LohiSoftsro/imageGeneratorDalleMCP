# Contributing to DALL-E 3 MCP Server for Cursor

Thank you for considering contributing to this project! This document outlines how to contribute to the DALL-E 3 MCP server for Cursor.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct: be respectful, considerate, and constructive in all interactions.

## How Can I Contribute?

### Reporting Bugs

If you find a bug, please create an issue with the following information:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Any relevant logs or error messages
- Your environment (Node.js version, OS, etc.)

### Suggesting Enhancements

For feature suggestions, please create an issue with:

- A clear, descriptive title
- A detailed description of the proposed feature
- Any relevant examples or use cases
- If applicable, mockups or diagrams

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Ensure tests pass (if applicable)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dalle-mcp-server.git
cd dalle-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Add your OpenAI API key to the `.env` file

5. Start the development server:
```bash
npm run dev
```

## Style Guide

- Use ESLint for JavaScript code
- Follow the existing code style
- Write clear, descriptive commit messages
- Document new functions and methods
- Add comments for complex logic

## Testing

Before submitting a PR, please test your changes:

- Ensure the server starts correctly
- Test any new endpoints or features
- Verify integration with Cursor IDE if applicable

## Additional Notes

### API Changes

If you're changing the API, please update:

- The documentation in README.md
- Any relevant JSDoc comments
- The web interface if applicable

### Adding Dependencies

Before adding new dependencies, consider:

- Is it actively maintained?
- Is it widely used?
- What's the performance impact?
- Could we implement the functionality ourselves?

## Questions?

If you have any questions, feel free to open an issue or reach out to the maintainers. 