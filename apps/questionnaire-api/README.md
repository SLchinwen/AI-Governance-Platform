# Questionnaire API (MVP)

This service provides S1/S2/S3 endpoints for the UI workbench.

## Run

```bash
npm install
npm run dev
```

Default URL: `http://localhost:4000`

## Endpoints

- `GET /health`
- `GET /api/v1/projects`
- `POST /api/v1/projects`
- `POST /api/v1/projects/:projectId/questionnaires`
- `GET /api/v1/questionnaires/:questionnaireId/questions?role={role}&stage={stage}`
- `GET /api/v1/questionnaires/:questionnaireId/answers`
- `POST /api/v1/questionnaires/:questionnaireId/answers`
- `PUT /api/v1/questionnaires/:questionnaireId/answers/:questionId`

## Notes

- This is a contract-compatible MVP for UI integration.
- When .NET SDK is available, replace implementation while keeping endpoint contracts.
