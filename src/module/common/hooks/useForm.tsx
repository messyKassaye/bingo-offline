import { Button, DatePicker, Form, Input, Select } from 'antd';
import { useEffect } from 'react';
import TextArea from 'antd/es/input/TextArea';

import { InboxOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
import { IFormElement } from '../../../models/IFormElement';
import SubmitButton from '../components/SubmitButton/SubmitButton';
import { useIntl } from 'react-intl';

type Props = {
  inputs: IFormElement[];
  onSubmit: (values: any) => void;
  onCancel?: () => void;
  onSearch?: (value: string) => void;
  is_edit_mode?: boolean;
  data?: any;
  loading: boolean;
  errorMessage?: string;
  showForgotPassword?: boolean;
  btnText?: string;
  cancelText?: string;
  success?: boolean;
  successMessage?: string;
};

const LuckyNumberForm = ({
  inputs,
  onSubmit,
  onCancel,
  onSearch,
  is_edit_mode = false,
  data,
  loading,
  errorMessage,
  btnText,
  cancelText,
  success,
  successMessage,
}: Props) => {
  const intl = useIntl();
  const { RangePicker } = DatePicker;
  const [LuckyNumberForm] = Form.useForm();

  const onFormSubmit = (values: any) => {
    onSubmit(values);
  };

  useEffect(() => {
    if (is_edit_mode) {
      LuckyNumberForm.setFieldsValue({
        ...data,
      });
    }
  }, [LuckyNumberForm, data, is_edit_mode]);

  const returnInput = (input: IFormElement) => {
    return (
      <Input
        type={input.type}
        value={input?.value}
        defaultValue={input?.value}
        disabled={input.disable}
        placeholder={intl.formatMessage({ id: input.placeholder })}
        name={input.name}
      />
    );
  };

  const returnTextArea = (input: IFormElement) => {
    return (
      <TextArea
        value={input.value}
        placeholder={intl.formatMessage({ id: input.placeholder })}
        autoSize={{ minRows: 5, maxRows: 6 }}
      />
    );
  };

  const renderFileInput = (input: IFormElement) => {
    return (
      <Upload beforeUpload={() => false} accept="image/*">
        <Button className="cancel-button mb-5" icon={<InboxOutlined />}>
          {input.placeholder}
        </Button>
      </Upload>
    );
  };

  const returnPassword = (input: IFormElement) => {
    return (
      <Input.Password
        type={input.type}
        value={input?.value}
        placeholder={intl.formatMessage({ id: input.placeholder })}
        name={input.name}
      />
    );
  };

  const renderSelect = (input: IFormElement) => {
    return input.isMultipleSelect ? (
      <Select
        showSearch
        className="w-full"
        style={{ width: 120 }}
        onSearch={onSearch}
        defaultValue={input.value}
        mode={input.isMultipleSelect ? 'multiple' : 'tags'}
        placeholder={intl.formatMessage({ id: input.placeholder })}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        options={input.options}
      />
    ) : (
      <Select
        showSearch
        className="w-full"
        style={{ width: 120 }}
        onSearch={onSearch}
        defaultValue={input.value}
        placeholder={intl.formatMessage({ id: input.placeholder })}
        filterOption={(input, option) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        options={input.options}
      />
    );
  };

  const renderDateRange = (input: IFormElement) => {
    return <RangePicker placement="bottomRight" />;
  };
  const renderInputField = (input: IFormElement) => {
    switch (input.type) {
      case 'text':
        return returnInput(input);

      case 'textarea':
        return returnTextArea(input);

      case 'password':
        return returnPassword(input);

      case 'file':
        return renderFileInput(input);

      case 'select':
        return renderSelect(input);
      case 'daterange':
        return renderDateRange(input);

      default:
        return null;
    }
  };

  return (
    <Form
      onFinish={onFormSubmit}
      form={LuckyNumberForm}
      layout="vertical"
      className="w-full"
      requiredMark={false}
      initialValues={is_edit_mode ? data : {}} // Set initial values here
    >
      {inputs.map((input, index) => (
        <Form.Item
          className={`mb-4 ${input.className}`}
          key={index}
          name={input.name}
          label={
            <span className="form-label">
              {intl.formatMessage({ id: input.label })}
            </span>
          }
          rules={[
            {
              required: input.is_required,
              message: intl.formatMessage({ id: input.required_message }),
            },
          ]}
        >
          {renderInputField(input)}
        </Form.Item>
      ))}

      {errorMessage && <span className="text-red-500">{errorMessage}</span>}
      {success && (
        <span className="flex text-green-400 text-lg">{successMessage}</span>
      )}
      <div className="flex items-center justify-end gap-4">
        {cancelText && (
          <Button
            onClick={onCancel}
            type="default"
            className="rounded-full p-5 cancel-button"
          >
            {cancelText || intl.formatMessage({ id: 'cancel' })}
          </Button>
        )}
        <SubmitButton
          text={btnText || intl.formatMessage({ id: 'submit' })}
          loading={loading}
        />
      </div>
    </Form>
  );
};

export default LuckyNumberForm;
