import React, { useState, useMemo, useEffect } from 'react';
import { View, Text } from 'react-native';
import type { Hospital } from '@/types/dtos/tenant/hospital.dto';
import { useHospitalUIStore } from '@/store/useHospitalUIStore';
import HospitalTextInput from './HospitalTextInput';
import HospitalSuggestions from './HospitalSuggestions';
import HospitalModal from './HospitalModal';

interface Props {
  hospitals: Hospital[];
  value?: string;
  onSelectHospital?: (hospital: Hospital) => void;
  onValidationChange?: (isValid: boolean) => void;
  isLoading?: boolean;
}

const HospitalInput: React.FC<Props> = ({
  hospitals, value, onSelectHospital, onValidationChange, isLoading
}) => {
  const { dropdownVisible, setDropdownVisible, setSectionExpanded } = useHospitalUIStore();
  const [inputText, setInputText] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isInputValid, setIsInputValid] = useState(false);

  useEffect(() => {
    if (value) {
      const selected = hospitals.find(h => h.externalCode === value);
      setInputText(selected?.name || '');
      setIsInputValid(!!selected);
      onValidationChange?.(!!selected);
    }
  }, [value, hospitals]);

  const filteredHospitals = useMemo(() => {
    if (!inputText) return hospitals;
    return hospitals.filter(h => h.name.toLowerCase().includes(inputText.toLowerCase()));
  }, [inputText, hospitals]);

  return (
    <View>
      <HospitalTextInput
        value={inputText}
        placeholder="Chọn bệnh viện"
        isLoading={isLoading}
        onChangeText={text => { setInputText(text); setDropdownVisible(true); setSectionExpanded('hospital', true); }}
        onFocus={() => { setDropdownVisible(true); setSectionExpanded('hospital', true); }}
        dropdownVisible={dropdownVisible}
        toggleDropdown={() => setDropdownVisible(!dropdownVisible)}
        isInputValid={isInputValid}
      />
      {!isInputValid && inputText.length > 0 && <Text style={{color:'red', marginTop:5}}>Bệnh viện không hợp lệ.</Text>}
      {dropdownVisible && filteredHospitals.length>0 &&
        <HospitalSuggestions suggestions={filteredHospitals} onSelect={setSelectedHospital} />
      }
      <HospitalModal
        hospital={selectedHospital}
        onCancel={() => setSelectedHospital(null)}
        onSelect={(hospital) => {
          setSelectedHospital(null);
          setInputText(hospital.name);
          setIsInputValid(true);
          onValidationChange?.(true);
          onSelectHospital?.(hospital);
          setSectionExpanded('hospital', false);
          setDropdownVisible(false);
          useHospitalUIStore.getState().setHospitalSelected(true); // mở bookingType
        }}
      />
    </View>
  );
};

export default HospitalInput;
