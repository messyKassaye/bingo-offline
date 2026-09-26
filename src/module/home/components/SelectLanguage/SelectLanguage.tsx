import { Select } from 'antd';
import { SUPPORTED_LANGUAGES } from '../../../../constants/constants';
import { ILanguage } from '../../../../models/ILanguage';
import { changeLocale } from '../../../../slices/LanguageSlice';
import { useAppDispatch } from '../../../../store/redux-hooks/redux-hooks';
import {
  getSelectedLanguage,
  storeSelectedLanguage,
} from '../../../../utils/utils';

const SelectLanguage = () => {
  const defaultLanguage = getSelectedLanguage();
  const dispatch = useAppDispatch();

  const languageOptions = SUPPORTED_LANGUAGES.map((language: ILanguage) => {
    return {
      value: language.code,
      label: language.name,
    };
  });

  const onHandleChange = (value: string, option: any) => {
    dispatch(
      changeLocale({
        code: option.value,
        id: 1,
        name: option.label,
      }),
    );
    storeSelectedLanguage(option);
  };
  return (
    <div className="flex items-center justify-end w-full">
      <Select
        dropdownStyle={{
          width: '120px',
        }}
        defaultValue={defaultLanguage !== null ? defaultLanguage : 'am'}
        options={languageOptions}
        onChange={onHandleChange}
      />
    </div>
  );
};

export default SelectLanguage;
