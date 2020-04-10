const _ = require("lodash");

// Costo por empleado por cobertura de salud/vida:
// i. Un empleado sin hijo/as tiene un costo de 0,279 UF.
// ii. Un empleado con 1 hijo/a tiene un costo de 0,4396 UF.
// iii. Un empleado con 2 o más hijo/as tiene un costo de 0,5599 UF.
const lifeCost = (worker) => {
  const { childs } = worker;
  if (childs === 0) {
    return 0.279;
  } else if (childs === 1) {
    return 0.4396;
  } else if (childs >= 2) {
    return 0.5599;
  }
};

// Costo por empleado por cobertura dental:
// i. Un empleado sin hijo/as tiene un costo de 0,12 UF.
// ii. Un empleado con 1 hijo/as tiene un costo de 0,1950 UF.
// iii. Un empleado con 2 o más hijo/as tiene un costo de 0,2480 UF.
const dentalCost = (worker) => {
  const { childs } = worker;
  if (childs === 0) {
    return 0.12;
  } else if (childs === 1) {
    return 0.195;
  } else if (childs >= 2) {
    return 0.248;
  }
};

// Empleados mayores a 65 años no tienen cobertura y por ende no tienen
// costo para la empresa.
const withoutCoverage = (worker) => {
  return worker.age > 65;
};

const withoutDental = (policy) => {
  return !policy.has_dental_care;
};

const getCoveragePercent = (total, percentage) => {
  return total * (percentage / 100);
};

const getTotal = ({ life, dental }) => {
  return life + dental;
};

const getEmployeePercent = (companyPercentage) => {
  return 100 - companyPercentage;
};

const getCoverage = (cost, percentage) => {
  return {
    life: getCoveragePercent(cost.life, percentage),
    dental: getCoveragePercent(cost.dental, percentage),
  };
};

const getCopay = (cost, coverage) => {
  return {
    life: cost.life - coverage.life,
    dental: cost.dental - coverage.dental,
  };
};

const policyCalc = (policyData) => {
  const costResult = _.reduce(
    policyData.workers,
    (acumulator, worker) => {
      var { dental, life, workers } = acumulator;
      var cost, coverage, copay;
      if (withoutCoverage(worker)) {
        cost = { life: 0, dental: 0 };
      } else if (withoutDental(policyData)) {
        cost = { life: lifeCost(worker), dental: 0 };
      } else {
        cost = {
          life: lifeCost(worker),
          dental: dentalCost(worker),
        };
      }
      coverage = getCoverage(cost, policyData.company_percentage);
      copay = getCopay(cost, coverage);
      workers.push({
        ...worker,
        cost: { ...cost, total: getTotal(cost) },
        coverage: {
          ...coverage,
          total: getTotal(coverage),
          percentage: policyData.company_percentage,
        },
        copay: {
          ...copay,
          total: getTotal(copay),
          percentage: getEmployeePercent(policyData.company_percentage),
        },
      });
      return { life: cost.life + life, dental: cost.dental + dental, workers };
    },
    { life: 0, dental: 0, workers: [] }
  );

  // El % de la empresa es el costo que asumirá la empresa del costo total de la
  // póliza, el resto es cubierto por cada empleado.
  const { workers, life, dental } = costResult;
  const { company_percentage, has_dental_care } = policyData;
  const employees_percentage = getEmployeePercent(company_percentage);

  const totalCost = { life, dental };
  const totalCoverage = getCoverage(totalCost, company_percentage);
  const totalCopay = getCopay(totalCost, totalCoverage);

  const totals = {
    cost: { ...totalCost, total: getTotal(totalCost) },
    coverage: { ...totalCoverage, total: getTotal(totalCoverage) },
    copay: { ...totalCopay, total: getTotal(totalCopay) },
    workers: workers.length,
    company_percentage,
    employees_percentage,
    has_dental_care,
  };

  return {
    policy: {
      workers,
      totals,
    },
  };
};

exports.policyCalc = policyCalc;
