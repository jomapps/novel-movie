# Movie Production app

## Technical stack
- mongodb
- nextjs 15.x
- payloadcms 3.x
- baml prompt engineering
- data access via payloadcms local api


## AI and Prompting
We will use ai to fill a lot of data
baml will be used at all stages
openrouter will be the llm provider
following keys will be avialabe in .env
the million model will be used when the context window needs to be expanded. it will be fallback

### OpenRouter (LLM operations)
OPENROUTER_API_KEY
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_DEFAULT_MODEL=anthropic/claude-sonnet-4
OPENROUTER_MILLION_MODEL=google/gemini-2.5-pro

### Fal.ai for LLM Media Generation
FAL_KEY and models will be available to do llm media generation
the api client will be used for llm media generation
pattern is:
```
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/flux-pro/kontext/text-to-image", {
  input: {
    prompt: "Extreme close-up of a single tiger eye, direct frontal view. Detailed iris and pupil. Sharp focus on eye texture and color. Natural lighting to capture authentic eye shine and depth. The word \"FLUX\" is painted over it in big, white brush strokes with visible texture."
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});
console.log(result.data);
console.log(result.requestId);
```
each llm will have its own requirement and documentation of the llm will be in /docs/aiModels

## Centralized Functions and routes dictionary
We will have a json file. this will be the single source of truth for all the functions and routes.
here is the structure of the json file:
```
{
  "name":{
    type: "function", // can be file or route
    file: "path/to/file", // required if type is file
    route: "/api/function-name", // required if type is route
    description: "Tells what it does", // short description of about 2 lines
  }
}
```
the aim of the file is the following:
- For you to ensure that you are not created duplicate functions / files / routes

## Critical rules
- we will never limit the tokens on our end. when required, the prompts will be used to limit the llm output.
- no fallbacks and no mockup data
- all custom routes will be nested in /src/app/v1
- ensure you use the imports correctly of the payload variable
- ensure you await all params, searchParams
- pages in nextjs are server side rendered. ensure you use the correct pattern to fetch data. create client side component if needed.
- prefer server side components over api routes

## GEtting the payload variable
the payload variable is required to access the payload api.
you have to use the following pattern to get it in api routes:
```
import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const GET = async (request: Request) => {
  const payload = await getPayload({
    config: configPromise,
  })

  return Response.json({
    message: 'This is an example of a custom route.',
  })
}
```
when using standalone scripts, you have to use the pattern to get the payload variable and also in the package.json file, you have to add the following:
```
[X]: "cross-env NODE_OPTIONS=--no-deprecation payload [script]",
```
where [X] stands for the name of the script. and [script] stands for the name of the script file in the scripts folder.

## Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.
Collections and baml structures will need to work together to create the app.

## Users (Authentication)
We will use payloads built in auth
Users are auth-enabled collections that have access to the admin panel.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/main/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

## Media
Media will always be uploaded to the R2 Cloudflare S3 compatible bucket via the automatic payloadcms media upload feature.

## Webhooks
Fal.ai supports webhooks to trigger the llm generation and get result.
Last frame service supports webhooks to get the last frame of the video.
Where possible, lets use lastframe webhooks to get the results.
ensure you run ngrok to test the webhooks locally.

## Local development setup
We have a windows 11 machine
pnpm, mongodb, redis and docker desktop are installed
ngrok can be run using
```
ngrok http 3000 --domain=local.ft.tc
```


## last frame service
this service has a lot of utilities. read /docs/externalServices/lastFrame.md
- length service to get the length of the video
- last frame service to get the last frame of the video
- video stitch service to stitch multiple videos
- audio stitch service to stitch multiple audios
- music track mixing service to mix videos with background music
- video+audio assembly service to combine scene videos with master audio and generate 3 output files

