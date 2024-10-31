import { Country, State, City } from "country-state-city";

const useLocation = () => {
  const getCountryByCode = (countryCode: string) => {
    return Country.getCountryByCode(countryCode);
  };

  const getCountryStates = (countryCode: string) => {
    return State.getAllStates().filter(
      (state) => state.countryCode === countryCode
    );
  };

  const getStateByCode = (countryCode: string, stateCode: string) => {
    const state = State.getAllStates().find(
      (state) =>
        state.countryCode === countryCode && state.isoCode === stateCode
    );

    if (!state) return null;

    return state;
  };

  const getStateCities = (countryCode: string, stateCode: string) => {
    return City.getAllCities().filter(
      (city) => city.countryCode === countryCode && city.stateCode === stateCode
    );
  };

  return {
    getAllCountries: Country.getAllCountries,
    getCountryByCode,
    getCountryStates,
    getStateByCode,
    getStateCities,
  };
};

export default useLocation;
