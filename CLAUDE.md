Before writing code, first explore the project structure, then invoke the chatgpt-app-builder skill for documentation.

We are creating an MCP app using claudes MCP App framework.

The user will prompt something like “Lets meet up”.
The workflow will then be the following:
The MCP app will suggest a time/series of times that work for all people.
The user will then be provided with a series of restaurant recommendations that suit all the users.
Once the user selects a time and a restaurant, we will compile a text message to send out to each person, confirming the plan!

The tech stack:
We will use a mock database to list available times for each user - ideally supabase

We will use the Yelp places API to fetch restaurants.

We will use whataspp-web.js to compose and send messages to each individual.

We will use the component library https://www.8bitcn.com/ to display this, going for a fun, retro feel to this
