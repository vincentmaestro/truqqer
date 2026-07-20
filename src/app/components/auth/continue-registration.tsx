'use client';
import { useActionState, useEffect, useReducer, useState, useTransition } from 'react';
import { signup } from '@/actions/signup';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Card, CardFooter, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/ui/card';
import { FileUpload } from '../file-upload';
import { ArrowLeft, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type SignupData= {
  type: 'name' | 'user-type' | 'gender' | 'password' | 'confirm-password'
  | 'vehicle-make' | 'vehicle-model' | 'vehicle-year' | 'vehicle-color'
  | 'vehicle-type' | 'vehicle-capacity' | 'vehicle-photo' | 'plate-number' 
  | 'driver-photo' | 'driver-license-number' | 'driver-license-photo'
  | 'vehicle-insurance-document' | 'vehicle-registration-document',
  value: string
}

export default function ContinueRegistration({ email, phone, }: {
  email: string;
  phone: string;
}) {
    const initialInputValues = {
      name: '', userType: '', gender: '', password: '', confirmPassword: '',
      vehicleMake: '', vehicleModel: '', vehicleYear: '', vehicleColor: '', vehicleType: '',
      vehicleCapacity: '', vehiclePhoto: '', plateNumber: '', driverPhoto: '', driverLicenseNumber: '',
      driverLicensePhoto: '', insuranceDocument: '', vehicleRegistration: ''
    };
    const [inputValue, setInputValue] = useReducer(reducer, initialInputValues);
    const [showDriverVehicleScreen, setShowDriverVehicleScreen] = useState(false);
    const [state, submit] = useActionState(signup, {
      success: false,
      errors: undefined,
      // data: undefined
    });
    const [loading, startTransition] = useTransition();
    const router = useRouter();

    function reducer(state: typeof initialInputValues, action: SignupData) {
      switch(action.type) {
        case 'name': return { ...state, name: action.value };
        case 'user-type': return { ...state, userType: action.value };
        case 'gender': return { ...state, gender: action.value };
        case 'password': return { ...state, password: action.value };
        case 'confirm-password': return { ...state, confirmPassword: action.value };
        case 'vehicle-make': return { ...state, vehicleMake: action.value };
        case 'vehicle-model': return { ...state, vehicleModel: action.value };
        case 'vehicle-year': return { ...state, vehicleYear: action.value };
        case 'vehicle-color': return { ...state, vehicleColor: action.value };
        case 'vehicle-type': return { ...state, vehicleType: action.value };
        case 'vehicle-capacity': return { ...state, vehicleCapacity: action.value };
        case 'vehicle-photo': return { ...state, vehiclePhoto: action.value };
        case 'plate-number': return { ...state, plateNumber: action.value };
        case 'driver-photo': return { ...state, driverPhoto: action.value };
        case 'driver-license-number': return { ...state, driverLicenseNumber: action.value };
        case 'driver-license-photo': return { ...state, driverLicensePhoto: action.value };
        case 'vehicle-insurance-document': return { ...state, insuranceDocument: action.value };
        case 'vehicle-registration-document': return { ...state, vehicleRegistration: action.value };

        default: return state;
      }
    }

    async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const form = new FormData(e.currentTarget);
      form.set('email', email),
      form.set('phone', phone),
      form.set('full-name', inputValue.name.trim());
      form.set('user-type', inputValue.userType.trim());
      form.set('gender', inputValue.gender.trim());
      form.set('password', inputValue.password.trim());
      form.set('confirm-password', inputValue.confirmPassword.trim());

      if(showDriverVehicleScreen) {
        form.set('vehicle-make', inputValue.vehicleMake.trim());
        form.set('vehicle-model', inputValue.vehicleModel.trim());
        form.set('vehicle-year', inputValue.vehicleYear.trim());
        form.set('vehicle-color', inputValue.vehicleColor.trim());
        form.set('vehicle-type', inputValue.vehicleType.trim());
        form.set('vehicle-capacity', inputValue.vehicleCapacity.trim());
        form.set('vehicle-photo', inputValue.vehiclePhoto);
        form.set('plate-number', inputValue.plateNumber.trim());
        form.set('driver-photo', inputValue.driverPhoto);
        form.set('driver-license-number', inputValue.driverLicenseNumber.trim());
        form.set('driver-license-photo', inputValue.driverLicensePhoto);
        form.set('vehicle-insurance-document', inputValue.insuranceDocument);
        form.set('vehicle-registration-document', inputValue.vehicleRegistration);
      }

      const token = await grecaptcha.execute(
      process.env.NEXT_PUBLIC_CAPTCHA_CLIENT_KEY!,
      { action: 'submit' }
      );
      form.set('captcha-token', token);

      startTransition(() => {
        submit(form);
      });
    }

    useEffect(() => {
      if(state.errors?.errorOn === 'driver-vehicle-screen')
        setShowDriverVehicleScreen(true);
    }, [state.errors, router]);

    useEffect(() => {
      const token = state.data?.token;

      state.data?.role === 'driver'
      ? router.replace(`/signup/pending-approval?token=${token}`)
      : state.data?.role === 'user'
      ? router.replace(`/explore`)
      : null;
    }, [state.success, router]);

    const truckTypes = [
    'boxed',
    'car carrier',
    'crane',
    'flatbed',
    'pickup truck',
    'tow van',
    'tipper',
    'mini truck',
    'tanker',
    ] as const;

    if(showDriverVehicleScreen)
      return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <button
            type="button"
            onClick={() => setShowDriverVehicleScreen(false)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <CardTitle className="text-2xl">Driver & Vehicle Details</CardTitle>
          <CardDescription>
            We need a few more details to create your driver account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Vehicle Information</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    name="make"
                    value={inputValue.vehicleMake}
                    onChange={e => setInputValue({ type: 'vehicle-make', value: e.target.value })}
                  />
                  {state.errors?.make && (
                    <p className="text-sm text-destructive font-medium">{state.errors.make}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    name="model"
                    value={inputValue.vehicleModel}
                    onChange={e => setInputValue({ type: 'vehicle-model', value: e.target.value })}
                  />
                  {state.errors?.model && (
                    <p className="text-sm text-destructive font-medium">{state.errors.model}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    min="1990"
                    max={new Date().getFullYear()}
                    value={inputValue.vehicleYear}
                    onChange={e => setInputValue({ type: 'vehicle-year', value: e.target.value })}
                  />
                  {state.errors?.year && (
                    <p className="text-sm text-destructive font-medium">{state.errors.year}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    name="color"
                    value={inputValue.vehicleColor}
                    onChange={e => setInputValue({ type: 'vehicle-color', value: e.target.value })}
                  />
                  {state.errors?.color && (
                    <p className="text-sm text-destructive font-medium">{state.errors.color}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="truck-type">Vehicle Type</Label>
                <Select
                name="vehicle-type"
                value={inputValue.vehicleType}
                onValueChange={value => setInputValue({ type: 'vehicle-type', value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {truckTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {state.errors?.type && (
                  <p className="text-sm text-destructive font-medium">{state.errors.truckType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="plate-number">License plate/Plate number</Label>
                <Input
                  id="plate-number"
                  name="plate-number"
                  className="uppercase"
                  value={inputValue.plateNumber}
                  onChange={e => setInputValue({ type: 'plate-number', value: e.target.value })}
                />
                {state.errors?.plateNumber && (
                  <p className="text-sm text-destructive font-medium">{state.errors.plateNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacity">Vehicle capacity (Kg or Litres) - Optional</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  value={inputValue.vehicleCapacity}
                  onChange={e => setInputValue({ type: 'vehicle-capacity', value: e.target.value })}
                />
                {state.errors?.capacity && (
                  <p className="text-sm text-destructive font-medium">{state.errors.capacity}</p>
                )}
              </div>

              <FileUpload
              label='Vehicle photo'
              name='vehicle-photo'
              accept='image/*'
              required
              folder='vehicle-photos'
              setInputValue={setInputValue}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Driver's Information</h3>

              <div className="space-y-2">
                <Label htmlFor="driver-license-number">License Number</Label>
                <Input
                  id="driver-license-number"
                  name="driver-license-number"
                  className="uppercase"
                  value={inputValue.driverLicenseNumber}
                  onChange={e => setInputValue({ type: 'driver-license-number', value: e.target.value })}
                />
                {state.errors?.licenseNumber && (
                  <p className="text-sm text-destructive font-medium">
                    {state.errors.licenseNumber}
                  </p>
                )}
              </div>

              <FileUpload
              label='Driver license photo'
              name='driver-license-photo'
              accept='image/*'
              required
              folder='driver-license-photos'
              setInputValue={setInputValue}
              />

              <FileUpload
              label='Driver photo/portrait'
              name='driver-photo'
              accept='image/*'
              required
              folder='driver-photos'
              setInputValue={setInputValue}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Vehicle Documents</h3>

              <FileUpload
              label='Vehicle insurance document'
              name='vehicle-insurance-document'
              accept='application/pdf'
              required
              folder='vehicle-insurance-docs'
              setInputValue={setInputValue}
              />

              <FileUpload
                label='Vehicle registration document'
                name='vehicle-registration-document'
                accept='application/pdf'
                required
                folder='vehicle-registration-docs'
                setInputValue={setInputValue}
                />
            </div>

            {state.errors?.message && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive font-medium">{state.errors.message}</p>
              </div>
            )}

            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-primary flex gap-x-3">
                <Info size={50} />
                <span>
                  Your account will be reviewed by our team. You'll receive a notification once approved (usually within 24-48 hours).
                </span>
              </p>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              By signing up, you agree to our{' '}
              <a 
                href="/terms-of-service" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Terms of Service
              </a>
              {' '}and{' '}
              <a 
                href="/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Privacy Policy
              </a>
              .
            </p>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting application...
                </span>
              ) : (
                'Submit Driver Application'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowDriverVehicleScreen(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back one step
          </button>
        </CardFooter>
      </Card>
    );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Complete your profile</CardTitle>
        <CardDescription>Just a few more to go...</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2 cursor-default">
            <p className="text-sm border-success/20 bg-success/10 text-success p-2.5 rounded-md">{email}</p>
            <p className="text-sm border-success/20 bg-success/10 text-success p-2.5 rounded-md">{phone}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input
              type="text"
              name="full-name"
              value={inputValue.name}
              onChange={e => setInputValue({ type: 'name', value: e.target.value })}
            />
            {state?.errors?.name && (
              <p className="text-sm text-destructive font-medium">{state?.errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-type">I want to</Label>
            <Select
            name="user-type"
            value={inputValue.userType}
            onValueChange={value => setInputValue({ type: 'user-type', value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Request truck services</SelectItem>
                <SelectItem value="driver">Offer truck services</SelectItem>
              </SelectContent>
            </Select>
            {state?.errors?.userType && (
              <p className="text-sm text-destructive font-medium">
                {state?.errors.userType}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
            name="gender"
            value={inputValue.gender}
            onValueChange={value => setInputValue({ type: 'gender', value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {state?.errors?.gender && (
              <p className="text-sm text-destructive font-medium">{state?.errors.gender}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
                id="password"
                type="password"
                name="password"
                value={inputValue.password}
                onChange={e => setInputValue({ type: 'password', value: e.target.value })}
            />
            {state?.errors?.password && (
              <p className="text-sm text-destructive font-medium">
                {state?.errors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type="password"
              name="confirm-password"
              value={inputValue.confirmPassword}
              onChange={e => setInputValue({ type: 'confirm-password', value: e.target.value })}
            />
            {state?.errors?.confirmPassword && (
              <p className="text-sm text-destructive font-medium">
                {state?.errors.confirmPassword}
              </p>
            )}
            {state?.errors?.message && (
              <p className="text-sm text-destructive font-medium">{state?.errors.message}</p>
            )}
          </div>

          {inputValue.userType !== 'driver' &&
            <p className="text-xs text-muted-foreground text-center">
              By signing up, you agree to our{' '}
              <a 
                href="/terms-of-service" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Terms of Service
              </a>
              {' '}and{' '}
              <a 
                href="/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Privacy Policy
              </a>
              .
            </p>
          }

          {inputValue.userType === 'driver' ? (
            <Button onClick={() => setShowDriverVehicleScreen(true)} className="w-full">
              Next
            </Button>
          ) : 
          (
            <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              'Create account'
            )}
          </Button>
        )}
        </form>
      </CardContent>
    </Card>
  );
}
