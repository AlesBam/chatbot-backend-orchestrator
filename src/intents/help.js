const HELP_MESSAGE = [
  'Umím ti pomoct s těmito věcmi:',
  '- zeptej se na stav objednávky (např. "jaký je stav mojí objednávky?")',
  '- zeptej se na počasí v libovolném městě (např. "jaké je počasí v Praze?")',
  '- napiš "pomoc", kdykoliv budeš chtít tuhle nápovědu znovu',
].join('\n');

async function handle(message, session) {
  return { reply: HELP_MESSAGE };
}

module.exports = { handle };
