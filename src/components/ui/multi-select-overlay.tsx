/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import {
  MultiValue,
  ActionMeta,
  SingleValue,
  components,
} from 'react-select';
import { Plus } from 'lucide-react';
import { addNewTag } from '../../hooks/addNewTag';

interface Option {
  value: string;
  label: string;
  color?: string;
}

interface MultiselectOverlayProps {
  options: Option[];
  selected: Option[];
  onFinishedEditing: (newValue: Option[]) => void;
  isSingleSelect?: boolean;
  mapId: string;
}

export const MultiselectOverlay = React.memo<MultiselectOverlayProps>(
  ({ options, selected, onFinishedEditing, isSingleSelect, mapId }) => {
    const [selectedValues, setSelectedValues] = useState<Option[]>(selected);
    const [inputValue, setInputValue] = useState('');

    const createNewTag = async (name: string) => {
      try {
        const color = '#' + Math.floor(Math.random()*16777215).toString(16);
        const data = await addNewTag(mapId, name, color);

        const newOption = {
          value: name,
          label: name,
          color: color,
        };

        const updatedValues = isSingleSelect 
          ? [newOption] 
          : [...selectedValues, newOption];

        setSelectedValues(updatedValues);
        onFinishedEditing(updatedValues);
        
        // Add the new option to the options list
        options.push(newOption);
        
        // Clear the input value after successful creation
        setInputValue('');
        
        return newOption;
      } catch (error) {
        console.error('Error creating tag:', error);
      }
    };

    const handleChange = (
      newValue: MultiValue<Option> | SingleValue<Option>,
    ) => {

      console.log('newValue', newValue);
      const updatedValues = isSingleSelect
        ? (newValue as SingleValue<Option>)
          ? [(newValue as SingleValue<Option>)]
          : []
        : [...(newValue as MultiValue<Option>)];

      setSelectedValues(updatedValues);
      onFinishedEditing(updatedValues);
    };

    // Custom NoOptionsMessage component with click handling
    const NoOptionsMessage = (props: any) => {
      return (
        <components.NoOptionsMessage {...props}>
          {inputValue ? (
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await createNewTag(inputValue);
              }}
              className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-900"
            >
              <Plus className="w-4 h-4" />
              Create "{inputValue}"
            </button>
          ) : (
            <div className="px-3 py-2 text-slate-500">No options</div>
          )}
        </components.NoOptionsMessage>
      );
    };

    // Add custom Option component to display with their colors
    const Option = ({ children, ...props }: any) => {
      return (
        <components.Option {...props}>
          <div
            style={{
              backgroundColor: props.data.color || '#e2e8f0',
              color: '#000000',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              display: 'inline-block',
            }}
          >
            {children}
          </div>
        </components.Option>
      );
    };

    const customStyles = {
      control: (base: any) => ({
        ...base,
        minHeight: '40px',
        borderColor: '#e2e8f0',
        boxShadow: 'none',
        '&:hover': {
          borderColor: '#cbd5e1',
        },
      }),
      menu: (base: any) => ({
        ...base,
        position: 'absolute',
        width: '100%',
        zIndex: 99999,
        boxShadow:
          '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }),
      menuList: (base: any) => ({
        ...base,
        padding: '4px',
        maxHeight: '200px',
      }),
      container: (base: any) => ({
        ...base,
        position: 'relative',
        zIndex: 99999,
      }),
      option: (base: any, state: any) => ({
        ...base,
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: state.isSelected
          ? '#0f172a'
          : state.isFocused
          ? '#f8fafc'
          : 'transparent',
      }),
    };

    return (
      <div className="bg-white rounded-lg shadow-lg max-w-[240px] relative">
        <CreatableSelect
          options={options}
          isMulti={!isSingleSelect}
          value={isSingleSelect ? selectedValues[0] : selectedValues}
          onChange={handleChange}
          onInputChange={(newValue) => setInputValue(newValue)}
          inputValue={inputValue}
          closeMenuOnSelect={isSingleSelect}
          placeholder="Select or type to create..."
          styles={customStyles}
          components={{ Option, NoOptionsMessage }}
          menuPortalTarget={document.body}
          menuPosition="fixed"
          menuPlacement="auto"
          className="w-full"
          formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
          createOptionPosition="first"
        />
      </div>
    );
  }
);
