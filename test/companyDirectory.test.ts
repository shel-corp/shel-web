import assert from "node:assert/strict";
import test from "node:test";

import { companyDirectoryTeams } from "../src/data/companyDirectory";

test("company directory groups contacts by alphabetically sorted teams", () => {
  assert.ok(companyDirectoryTeams.length >= 5);
  const teamNames = companyDirectoryTeams.map((team) => team.name);
  assert.deepEqual(teamNames, [...teamNames].sort((a, b) => a.localeCompare(b)));

  for (const team of companyDirectoryTeams) {
    assert.ok(team.id, `${team.name} exposes a stable id`);
    assert.ok(team.mandate, `${team.name} exposes a public mandate`);
    assert.ok(team.contacts.length > 0, `${team.name} has at least one contact`);
    const contactNames = team.contacts.map((contact) => contact.name);
    assert.deepEqual(contactNames, [...contactNames].sort((a, b) => a.localeCompare(b)));
  }
});

test("company directory includes public routing coverage for core Shelcorp teams", () => {
  const teams = new Map(companyDirectoryTeams.map((team) => [team.name, team]));

  for (const expectedTeam of [
    "Commercial Operations",
    "Documentation Integrity",
    "Operator Relations",
    "Platform Reliability",
    "Systems Research",
    "Workflow Compliance",
  ]) {
    assert.ok(teams.has(expectedTeam), `missing ${expectedTeam}`);
  }

  assert.ok(
    teams.get("Platform Reliability").contacts.some((contact) => contact.email === "sre@shelcorp.com"),
    "Platform Reliability routes SRE mail",
  );
});
