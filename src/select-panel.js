// @flow
/**
 * This component represents the entire panel which gets dropped down when the
 * user selects the component.  It encapsulates the search filter, the
 * Select-all item, and the list of options.
 */
import {filterOptions} from 'fuzzy-match-utils';
import React, {Component} from 'react';

import SelectItem from './select-item.js';
import SelectList from './select-list.js';

import type {
    Option,
} from './select-item.js';

class SelectPanel extends Component {
    state = {
        searchHasFocus: false,
        searchText: "",
        focusIndex: 0,
    }

    props: {
        ItemRenderer?: Function,
        options: Array<Option>,
        selected: Array<any>,
        selectAllLabel?: string,
        onSelectedChanged: (selected: Array<any>) => void,
    }

    selectAll = () => {
        const {onSelectedChanged, options} = this.props;
        const allValues = options.map(o => o.value);

        onSelectedChanged(allValues);
    }

    selectNone = () => {
        const {onSelectedChanged} = this.props;

        onSelectedChanged([]);
    }

    selectAllChanged = (checked: boolean) => {
        if (checked) {
            this.selectAll();
        } else {
            this.selectNone();
        }
    }

    handleSearchChange = (e: {target: {value: any}}) => {
        this.setState({
            searchText: e.target.value,
            focusIndex: -1,
        });
    }

    handleItemClicked = (index: number) => {
        this.setState({focusIndex: index});
    }

    clearSearch = () => {
        this.setState({searchText: ""});
    }

    handleKeyDown = (e: KeyboardEvent) => {
        switch (e.which) {
            case 38: // Up Arrow
                if (e.altKey) {
                    return;
                }

                this.updateFocus(-1);
                break;
            case 40: // Down Arrow
                if (e.altKey) {
                    return;
                }

                this.updateFocus(1);
                break;
            default:
                return;
        }

        e.stopPropagation();
        e.preventDefault();
    }

    handleSearchFocus = (searchHasFocus: boolean) => {
        this.setState({
            searchHasFocus,
            focusIndex: -1,
        });
    }

    allAreSelected() {
        const {options, selected} = this.props;
        return options.length === selected.length;
    }

    filteredOptions() {
        const {searchText} = this.state;
        const {options} = this.props;

        return filterOptions(options, searchText);
    }

    updateFocus(offset: number) {
        const {focusIndex} = this.state;
        const {options} = this.props;

        let newFocus = focusIndex + offset;
        newFocus = Math.max(0, newFocus);
        newFocus = Math.min(newFocus, options.length);

        this.setState({focusIndex: newFocus});
    }

    render() {
        const {focusIndex, searchHasFocus} = this.state;
        const {ItemRenderer, selectAllLabel} = this.props;

        const selectAllOption = {
            label: selectAllLabel || "Select All",
            value: "",
        };

        const focusedSearchStyle = searchHasFocus
            ? styles.searchFocused
            : undefined;

        return <div
            style={styles.panel}
            role="listbox"
            onKeyDown={this.handleKeyDown}
        >
            {props.hasSearch && <div style={styles.searchContainer}>
                <input
                    placeholder="Search"
                    type="text"
                    onChange={this.handleSearchChange}
                    style={{...styles.search, ...focusedSearchStyle}}
                    onFocus={() => this.handleSearchFocus(true)}
                    onBlur={() => this.handleSearchFocus(false)}
                />
            </div>}

            <SelectItem
                focused={focusIndex === 0}
                checked={this.allAreSelected()}
                option={selectAllOption}
                onSelectionChanged={this.selectAllChanged}
                onClick={() => this.handleItemClicked(0)}
                ItemRenderer={ItemRenderer}
            />

            <SelectList
                {...this.props}
                options={this.filteredOptions()}
                focusIndex={focusIndex - 1}
                onClick={(e, index) => this.handleItemClicked(index + 1)}
                ItemRenderer={ItemRenderer}
            />
        </div>;
    }
}

const styles = {
    panel: {
        boxSizing : 'border-box',
    },
    search: {
        display: "block",

        maxWidth: "100%",
        borderRadius: "3px",

        boxSizing : 'border-box',
        height: '30px',
        lineHeight: '24px',
        border: '1px solid',
        borderColor: '#dee2e4',
        padding: '10px',
        width: "100%",
        outline: "none",
    },
    searchFocused: {
        borderColor: "#78c008",
    },
    searchContainer: {
        width: "100%",
        boxSizing : 'border-box',
        padding: "0.5em",
    },
};

export default SelectPanel;
