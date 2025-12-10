import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useForm from './useForm';

describe('useForm', () => {
  it('initializes with initial values', () => {
    const initialValues = { email: '', password: '' };
    const { result } = renderHook(() => useForm(() => {}, initialValues));

    expect(result.current.values).toEqual(initialValues);
  });

  it('updates values when changeHandler is called', () => {
    const initialValues = { email: '', password: '' };
    const { result } = renderHook(() => useForm(() => {}, initialValues));

    act(() => {
      const mockEvent = {
        target: {
          name: 'email',
          value: 'test@example.com'
        }
      };
      result.current.changeHandler(mockEvent);
    });

    expect(result.current.values.email).toBe('test@example.com');
  });

  it('register function returns correct props', () => {
    const initialValues = { email: 'test@example.com', password: '' };
    const { result } = renderHook(() => useForm(() => {}, initialValues));

    const registered = result.current.register('email');

    expect(registered).toEqual({
      name: 'email',
      value: 'test@example.com',
      onChange: expect.any(Function)
    });
  });

  it('calls callback when formAction is called', () => {
    const callback = vi.fn();
    const initialValues = { email: 'test@example.com', password: '123456' };
    const { result } = renderHook(() => useForm(callback, initialValues));

    act(() => {
      result.current.formAction();
    });

    expect(callback).toHaveBeenCalledWith(
      { email: 'test@example.com', password: '123456' },
      undefined
    );
  });

  it('allows setting values directly with setValues', () => {
    const initialValues = { email: '', password: '' };
    const { result } = renderHook(() => useForm(() => {}, initialValues));

    act(() => {
      result.current.setValues({ email: 'new@example.com', password: 'newpass' });
    });

    expect(result.current.values).toEqual({
      email: 'new@example.com',
      password: 'newpass'
    });
  });

  it('handles multiple field updates', () => {
    const initialValues = { email: '', password: '', username: '' };
    const { result } = renderHook(() => useForm(() => {}, initialValues));

    act(() => {
      result.current.changeHandler({
        target: { name: 'email', value: 'test@example.com' }
      });
    });

    act(() => {
      result.current.changeHandler({
        target: { name: 'password', value: '123456' }
      });
    });

    expect(result.current.values).toEqual({
      email: 'test@example.com',
      password: '123456',
      username: ''
    });
  });
});

