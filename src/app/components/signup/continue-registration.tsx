'use client';
import { useActionState, useReducer, useState, useTransition } from 'react';
import { signup } from '@/actions/signup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type InputType= {
    type: 'name' | 'user-type' | 'gender' | 'password' | 'confirm-password',
    value: string
}

export default function ContinueRegistration({
  email,
  phone,
}: {
  email: string;
  phone: string;
}) {
    const initialInputValues = {
        name: '',
        userType: '',
        gender: '',
        password: '',
        confirmPassword: ''
    };
    const [inputValue, setInputValue] = useReducer(reducer, initialInputValues);
    const [driverSignup, setDriverSignup] = useState(false);
    const [state, submit] = useActionState(signup, {
        success: false as const,
        errors: undefined
    });
    const [loading, startTransition] = useTransition();

    function reducer(state: typeof initialInputValues, action: InputType) {
        switch(action.type) {
            case 'name': return { ...state, name: action.value };
            case 'user-type': return { ...state, userType: action.value };
            case 'gender': return { ...state, gender: action.value };
            case 'password': return { ...state, password: action.value };
            case 'confirm-password': return { ...state, confirmPassword: action.value };

            default: return state;
        }
    }

    async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const form = new FormData(e.currentTarget);
        const token = await grecaptcha.execute(
        '6LfYZKUsAAAAAB_0BQnWUfHOjWBjVrOayt4aSZvP',
        { action: 'submit' }
        );

        startTransition(() => {
            form.set('captcha-token', token);
            submit(form);
        });
    }

    const TRUCK_TYPES = [
    'flatbed',
    'boxed',
    'tow van',
    'tipper',
    'car carrier',
    'mini truck',
    'tanker',
    ] as const;

    const [previews, setPreviews] = useState<{
        vehiclePhoto?: string;
        licenseImage?: string;
        insuranceDocument?: string;
        registrationDocument?: string;
    }>({});

    function handleFilePreview(e: React.ChangeEvent<HTMLInputElement>, field: string) {
        const file = e.target.files?.[0];
        if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviews((prev) => ({ ...prev, [field]: reader.result as string }));
        };
        reader.readAsDataURL(file);
        }
    }

    if(driverSignup)
          return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Driver & Vehicle Details</CardTitle>
        <CardDescription>
          We need a few more details to verify your driver account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={submit} className="space-y-6">
          {/* Hidden fields from previous step */}
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="phone" value={phone} />
          {/* <input type="hidden" name="name" value={name} />
          <input type="hidden" name="gender" value={gender} />
          <input type="hidden" name="password" value={password} /> */}

          {/* ========== VEHICLE INFO SECTION ========== */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Vehicle Information</h3>

            {/* Make & Model (Side by Side) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  name="make"
                  placeholder="Toyota"
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
                  placeholder="Hilux"
                />
                {state.errors?.model && (
                  <p className="text-sm text-destructive font-medium">{state.errors.model}</p>
                )}
              </div>
            </div>

            {/* Year & Color */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  placeholder="2020"
                  min="1990"
                  max={new Date().getFullYear()}
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
                  placeholder="White"
                />
                {state.errors?.color && (
                  <p className="text-sm text-destructive font-medium">{state.errors.color}</p>
                )}
              </div>
            </div>

            {/* Truck Type */}
            <div className="space-y-2">
              <Label htmlFor="truck-type">Vehicle Type</Label>
              <Select name="truck-type">
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  {TRUCK_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.truckType && (
                <p className="text-sm text-destructive font-medium">{state.errors.truckType}</p>
              )}
            </div>

            {/* Plate Number */}
            <div className="space-y-2">
              <Label htmlFor="plate-number">Plate Number</Label>
              <Input
                id="plate-number"
                name="plate-number"
                placeholder="ABC-123-XY"
                className="uppercase"
              />
              {state.errors?.plateNumber && (
                <p className="text-sm text-destructive font-medium">{state.errors.plateNumber}</p>
              )}
            </div>

            {/* Capacity (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (kg) - Optional</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                placeholder="1000"
              />
              {state.errors?.capacityKg && (
                <p className="text-sm text-destructive font-medium">{state.errors.capacityKg}</p>
              )}
            </div>

            {/* Vehicle Photo */}
            <div className="space-y-2">
              <Label htmlFor="vehicle-photo">Vehicle Photo</Label>
              <Input
                id="vehicle-photo"
                name="vehicle-photo"
                type="file"
                accept="image/*"
                onChange={(e) => handleFilePreview(e, 'vehiclePhoto')}
              />
              {previews.vehiclePhoto && (
                <div className="mt-2 rounded-lg border overflow-hidden">
                  <img
                    src={previews.vehiclePhoto}
                    alt="Vehicle preview"
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
              {state.errors?.photo && (
                <p className="text-sm text-destructive font-medium">{state.errors.photo}</p>
              )}
            </div>
          </div>

          {/* ========== DRIVER LICENSE SECTION ========== */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Driver's License</h3>

            {/* License Number */}
            <div className="space-y-2">
              <Label htmlFor="license-number">License Number</Label>
              <Input
                id="license-number"
                name="license-number"
                placeholder="ABC12345678"
                className="uppercase"
              />
              {state.errors?.licenceNumber && (
                <p className="text-sm text-destructive font-medium">
                  {state.errors.licenceNumber}
                </p>
              )}
            </div>

            {/* License Image */}
            <div className="space-y-2">
              <Label htmlFor="license-image">License Photo</Label>
              <Input
                id="license-image"
                name="license-image"
                type="file"
                accept="image/*"
                onChange={(e) => handleFilePreview(e, 'licenseImage')}
              />
              {previews.licenseImage && (
                <div className="mt-2 rounded-lg border overflow-hidden">
                  <img
                    src={previews.licenseImage}
                    alt="License preview"
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
              {state.errors?.licenseImage && (
                <p className="text-sm text-destructive font-medium">
                  {state.errors.licenseImage}
                </p>
              )}
            </div>
          </div>

          {/* ========== DOCUMENTS SECTION ========== */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Vehicle Documents</h3>

            {/* Insurance Document (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="insurance-document">
                Insurance Document <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="insurance-document"
                name="insurance-document"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFilePreview(e, 'insuranceDocument')}
              />
              {previews.insuranceDocument && (
                <div className="mt-2 p-3 rounded-lg border bg-muted">
                  <p className="text-sm text-muted-foreground">✓ Document uploaded</p>
                </div>
              )}
              {state.errors?.insuranceDocument && (
                <p className="text-sm text-destructive font-medium">
                  {state.errors.insuranceDocument}
                </p>
              )}
            </div>

            {/* Registration Document (NEW - RECOMMENDED) */}
            <div className="space-y-2">
              <Label htmlFor="registration-document">
                Vehicle Registration <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="registration-document"
                name="registration-document"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handleFilePreview(e, 'registrationDocument')}
              />
              {previews.registrationDocument && (
                <div className="mt-2 p-3 rounded-lg border bg-muted">
                  <p className="text-sm text-muted-foreground">✓ Document uploaded</p>
                </div>
              )}
            </div>
          </div>

          {/* Info Banner */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-primary">
              ℹ️ Your account will be reviewed by our team. You'll receive a notification once
              approved (usually within 24-48 hours).
            </p>
          </div>

          {/* General Error Message */}
          {state.errors?.message && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive font-medium">{state.errors.message}</p>
            </div>
          )}

          {/* Submit Button */}
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
          
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="phone" value={phone} />

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
            <Select name="user-type" onValueChange={value => setInputValue({ type: 'user-type', value })}>
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
            <Select name="gender" onValueChange={value => setInputValue({ type: 'gender', value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
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
                placeholder="••••••••"
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
              placeholder="••••••••"
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

          {inputValue.userType === 'driver' ? (
            <Button onClick={() => setDriverSignup(true)} className="w-full">
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