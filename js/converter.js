/* CFD Bonus Ratgeber — converter.js
   Two illustrative calculators:
   1. Spread-Kosten-Rechner (Bonus-Broker vs. ECN-Broker)
   2. Umsatzbedingung-Rechner (Rollover)
   All figures are illustrative examples ("brokerabhängig") — see disclaimers in markup. */

(function () {
  'use strict';

  /* --------------------------------------------------------------------
     1) Spread-Kosten-Rechner
     -------------------------------------------------------------------- */

  var pipValues = {
    'EUR/USD': 10,
    'GBP/USD': 10,
    'XAU/USD': 1,
    'DAX': 1
  };

  var ECN_SPREAD_PIPS = 0.2;
  var ECN_COMMISSION_PER_LOT = 7; // round-turn, illustrative

  function calcSpreadCost(spreadPips, lots, instrument) {
    var pipValue = pipValues[instrument] || pipValues['EUR/USD'];
    return spreadPips * pipValue * lots;
  }

  function calcECNCost(lots, instrument) {
    var pipValue = pipValues[instrument] || pipValues['EUR/USD'];
    return (ECN_SPREAD_PIPS * pipValue) * lots + ECN_COMMISSION_PER_LOT * lots;
  }

  function formatEUR(value) {
    return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }

  function updateSpreadCalculator(form) {
    var spreadInput = form.querySelector('[data-field="spread"]');
    var lotsInput = form.querySelector('[data-field="lots"]');
    var instrumentInput = form.querySelector('[data-field="instrument"]');

    var spread = parseFloat(spreadInput.value);
    var lots = parseFloat(lotsInput.value);
    var instrument = instrumentInput.value;

    if (isNaN(spread) || spread < 0) spread = 0;
    if (isNaN(lots) || lots < 0) lots = 0;

    var bonusBrokerCost = calcSpreadCost(spread, lots, instrument);
    var ecnCost = calcECNCost(lots, instrument);
    var advantage = bonusBrokerCost - ecnCost;

    var resultBonus = form.querySelector('[data-result="bonus"]');
    var resultECN = form.querySelector('[data-result="ecn"]');
    var resultAdvantage = form.querySelector('[data-result="advantage"]');

    if (resultBonus) resultBonus.textContent = formatEUR(bonusBrokerCost);
    if (resultECN) resultECN.textContent = formatEUR(ecnCost);
    if (resultAdvantage) resultAdvantage.textContent = formatEUR(advantage);
  }

  document.querySelectorAll('[data-calculator="spread"]').forEach(function (form) {
    form.querySelectorAll('input, select').forEach(function (field) {
      field.addEventListener('input', function () { updateSpreadCalculator(form); });
      field.addEventListener('change', function () { updateSpreadCalculator(form); });
    });
    updateSpreadCalculator(form);
  });

  /* --------------------------------------------------------------------
     2) Umsatzbedingung-Rechner (Rollover)
     -------------------------------------------------------------------- */

  function updateRolloverCalculator(form) {
    var bonusInput = form.querySelector('[data-field="bonus-amount"]');
    var factorInput = form.querySelector('[data-field="rollover-factor"]');
    var daysInput = form.querySelector('[data-field="time-limit"]');

    var bonusAmount = parseFloat(bonusInput.value);
    var factorPercent = parseFloat(factorInput.value);
    var days = parseFloat(daysInput.value);

    if (isNaN(bonusAmount) || bonusAmount < 0) bonusAmount = 0;
    if (isNaN(factorPercent) || factorPercent < 0) factorPercent = 0;
    if (isNaN(days) || days <= 0) days = 1;

    var requiredLots = bonusAmount * (factorPercent / 100);
    var lotsPerDay = requiredLots / days;
    var dailyPipVolume = lotsPerDay * 10000; // illustrative: 1 Standard-Lot ≈ 100,000 units → simplified daily EUR volume proxy

    var resultLots = form.querySelector('[data-result="required-lots"]');
    var resultPerDay = form.querySelector('[data-result="lots-per-day"]');
    var resultVolume = form.querySelector('[data-result="daily-volume"]');

    if (resultLots) resultLots.textContent = requiredLots.toLocaleString('de-DE', { maximumFractionDigits: 1 });
    if (resultPerDay) resultPerDay.textContent = lotsPerDay.toLocaleString('de-DE', { maximumFractionDigits: 2 });
    if (resultVolume) resultVolume.textContent = formatEUR(dailyPipVolume);
  }

  document.querySelectorAll('[data-calculator="rollover"]').forEach(function (form) {
    form.querySelectorAll('input, select').forEach(function (field) {
      field.addEventListener('input', function () { updateRolloverCalculator(form); });
      field.addEventListener('change', function () { updateRolloverCalculator(form); });
    });
    updateRolloverCalculator(form);
  });
})();
