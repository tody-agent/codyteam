// config-lock.mjs — ConfigChange: agents cannot rewrite hook settings mid-session
if (process.env.SWARM_ADMIN !== '1') {
  process.stderr.write('Swarm settings are locked. Set SWARM_ADMIN=1 (human) to change.');
  process.exit(2);
}
