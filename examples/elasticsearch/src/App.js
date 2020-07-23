import React from "react";

import {
  ErrorBoundary,
  SearchProvider,
  WithSearch,
  SearchBox,
  Results,
  PagingInfo,
  ResultsPerPage,
  Paging,
    Sorting,
    Facet
} from "@elastic/react-search-ui";
import { Layout} from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";
import applyDisjunctiveFaceting from "./applyDisjunctiveFaceting";
import buildRequest from "./buildRequest";
import runRequest from "./runRequest";
import buildState from "./buildState";








const config = {
  debug: true,
  hasA11yNotifications: true,
  onResultClick: () => {
    /* Not implemented */
  },
  onAutocompleteResultClick: () => {
    /* Not implemented */
  },
  onAutocomplete: async ({ searchTerm }) => {
    const requestBody = buildRequest({ searchTerm });
    const json = await runRequest(requestBody);
    const state = buildState(json);
    return {
      autocompletedResults: state.results
    };
  },
  onSearch: async state => {
    const { resultsPerPage } = state;
    const requestBody = buildRequest(state);
    // Note that this could be optimized by running all of these requests
    // at the same time. Kept simple here for clarity.
    const responseJson = await runRequest(requestBody);
    return buildState(responseJson, resultsPerPage);
  }
};

export default function App() {

  return (
    <SearchProvider config={config}>
      <WithSearch mapContextToProps={({ wasSearched }) => ({ wasSearched })}>
        {({ wasSearched }) => (
          <div className="App">
            <ErrorBoundary>
              <Layout
                header={
                  <SearchBox
                      autocompleteMinimumCharacters={3}
                      autocompleteResults={{
                        linkTarget: "_blank",
                        sectionTitle: "Results",
                        titleField: "id",
                        shouldTrackClickThrough: true,
                        clickThroughTags: ["test"]
                      }}
                      autocompleteSuggestions={true}
                  />
                }
                sideContent={
                  <div>
                    {wasSearched && (
                        <Sorting
                            label={"Sort by"}
                            sortOptions={[
                              {
                                name: "Relevance",
                                value: "",
                                direction: ""
                              },
                              {
                                name: "ID",
                                value: "id",
                                direction: "asc"
                              }
                            ]}
                        />
                    )}
                    <Facet
                        field="positions.pointOfConsumption"
                        label="Point of Consumption"
                        filterType="any"
                        isFilterable={true}
                    />
                    <Facet
                        field="positions.supplierPartNumber"
                        label="Supplier Part Number"
                        filterType="any"
                        isFilterable={true}
                    />
                  </div>
                }
                bodyContent={
                  <Results
                      titleField="id"
                      shouldTrackClickThrough={true}
                  />
                }
                bodyHeader={
                  <React.Fragment>
                    {wasSearched && <PagingInfo />}
                    {wasSearched && <ResultsPerPage />}
                  </React.Fragment>
                }
                bodyFooter={<Paging />}
              />
            </ErrorBoundary>
          </div>
        )}
      </WithSearch>
    </SearchProvider>
  );
}
