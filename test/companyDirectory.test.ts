import assert from "node:assert/strict";
import test from "node:test";

import { users } from "../server/db/schema";
import { groupUsersByTeam, seededUsers } from "../server/directory/users";
import { companyDirectoryTeams } from "../src/data/generated/companyDirectory";

test("users table exposes the directory columns", () => {
  assert.ok(users.id, "users.id column exists");
  assert.ok(users.name, "users.name column exists");
  assert.ok(users.team, "users.team column exists");
  assert.ok(users.role, "users.role column exists");
  assert.ok(users.personality, "users.personality column exists");
  assert.ok(users.systemPrompt, "users.systemPrompt column exists");
});

test("seeded directory users include required persona fields", () => {
  assert.ok(seededUsers.length >= 6);
  for (const user of seededUsers) {
    assert.ok(user.id, `${user.name} has a stable id`);
    assert.ok(user.name, `${user.id} has a name`);
    assert.ok(user.team, `${user.id} has a team`);
    assert.ok(user.role, `${user.id} has a role`);
    assert.ok(user.personality, `${user.id} has a personality`);
    assert.ok(user.systemPrompt, `${user.id} has a system prompt`);
  }
});

test("directory groups table users by alphabetically sorted teams and names", () => {
  const teams = groupUsersByTeam(seededUsers);
  const teamNames = teams.map((team) => team.name);
  assert.deepEqual(teamNames, [...teamNames].sort((a, b) => a.localeCompare(b)));

  for (const team of teams) {
    const userNames = team.users.map((user) => user.name);
    assert.deepEqual(userNames, [...userNames].sort((a, b) => a.localeCompare(b)));
  }
});

test("rendered directory data is generated from users, not hand-authored contacts", () => {
  const teams = new Map(companyDirectoryTeams.map((team) => [team.name, team]));
  assert.ok(teams.has("Platform Reliability"));
  assert.ok(
    teams.get("Platform Reliability")?.users.some((user) => user.role === "Infrastructure & Reliability"),
    "Platform Reliability renders SRE user role from generated table data",
  );
  assert.ok(
    companyDirectoryTeams.every((team) => team.users.every((user) => user.personality && user.systemPrompt)),
    "rendered directory includes table-backed persona fields",
  );
});
