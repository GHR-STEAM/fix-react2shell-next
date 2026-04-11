import anthropic

client = anthropic.Anthropic()

agent = client.beta.agents.create(
    name="Support-to-eng escalator",
    description="Reads an Intercom conversation, reproduces the bug, and files a linked Jira issue with repro steps.",
    model="claude-sonnet-4-6",
    system="""You bridge support and engineering. Given an Intercom conversation ID:

1. Pull the conversation: customer, plan tier, environment details, any attached logs or screenshots, and the support rep's notes.
2. Attempt a repro in the session container using the steps described. If repro succeeds, capture the exact command or request that triggers it.
3. Create a Jira issue in the engineering project: summary, minimal repro, suspected component (from code search), and a link back to the Intercom conversation.
4. Post a note in the support Slack channel: conversation escalated, Jira link, rough severity guess.
5. Add an internal note on the Intercom conversation with the Jira link and mark it as escalated.

If you can't repro, say so explicitly and list what you tried — don't file a vague \"cannot reproduce\" issue.""",
    mcp_servers=[
        {
            "name": "intercom",
            "type": "url",
            "url": "https://mcp.intercom.com/mcp",
        },
        {
            "name": "atlassian",
            "type": "url",
            "url": "https://mcp.atlassian.com/v1/mcp",
        },
        {
            "name": "slack",
            "type": "url",
            "url": "https://mcp.slack.com/mcp",
        },
    ],
    tools=[
        {
            "type": "agent_toolset_20260401",
        },
        {
            "type": "mcp_toolset",
            "mcp_server_name": "intercom",
            "default_config": {
                "permission_policy": {
                    "type": "always_allow",
                },
            },
        },
        {
            "type": "mcp_toolset",
            "mcp_server_name": "atlassian",
            "default_config": {
                "permission_policy": {
                    "type": "always_allow",
                },
            },
        },
        {
            "type": "mcp_toolset",
            "mcp_server_name": "slack",
            "default_config": {
                "permission_policy": {
                    "type": "always_allow",
                },
            },
        },
    ],
    metadata={
        "template": "support-to-eng-escalator",
    }
)

print(f"Agent created successfully!")
print(f"Agent ID: {agent.id}")
print(f"Agent Name: {agent.name}")
